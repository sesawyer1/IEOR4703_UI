from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from pathlib import Path
import tempfile
import nbformat
import pandas as pd
from nbclient import NotebookClient

app = FastAPI()

# ---- CORS (Vite dev server) ----
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- Content + execution cache ----
CONTENT_ROOT = (Path(__file__).parent / "content").resolve()

# store last executed notebook path per relative path
EXEC_CACHE: dict[str, str] = {}


@app.get("/health")
def health():
    return {"ok": True}


def safe_resolve(rel_path: str) -> Path:
    """
    Resolve a relative path under CONTENT_ROOT, blocking path traversal.
    rel_path example: 'Data/1.LCG/hist_example.ipynb'
    """
    if not rel_path or rel_path.startswith(("/", "\\")) or ".." in rel_path:
        raise HTTPException(status_code=400, detail="Invalid path")

    full = (CONTENT_ROOT / rel_path).resolve()

    # Ensure resolved path stays inside CONTENT_ROOT
    if not str(full).startswith(str(CONTENT_ROOT)):
        raise HTTPException(status_code=400, detail="Invalid path")

    if not full.exists():
        raise HTTPException(status_code=404, detail=f"File not found: {rel_path}")

    return full


@app.get("/api/notebook")
def get_notebook(path: str):
    nb_path = safe_resolve(path)
    if nb_path.suffix.lower() != ".ipynb":
        raise HTTPException(status_code=400, detail="Not a .ipynb notebook")

    nb = nbformat.read(nb_path, as_version=4)
    return JSONResponse(content=nb)


class ExecuteRequest(BaseModel):
    path: str
    timeout: int = 120  # seconds


class ExecuteNotebookBody(BaseModel):
    """
    Execute an *edited* notebook (passed as JSON), but still use the folder of the
    original notebook path as the working directory, so local sibling .py imports work.
    """
    notebook: dict
    path: str
    timeout: int = 120  # seconds


def execute_nb_in_dir(nb, nb_dir: str, timeout: int):
    """
    Execute a notebook object cell-by-cell using nbclient, with a specific working dir.
    Returns (executed_nb, run_error, last_cell_index).
    """
    client = NotebookClient(
        nb,
        timeout=timeout,
        kernel_name="python3",
        resources={"metadata": {"path": nb_dir}},  # ✅ cwd for execution
    )

    last_cell = -1
    run_error = None

    # ✅ Critical: start/stop kernel for execute_cell loop
    try:
        with client.setup_kernel():
            for i, cell in enumerate(nb.cells):
                last_cell = i
                client.execute_cell(cell, i)
    except Exception as e:
        run_error = f"Error in cell {last_cell}: {e}"

    return nb, run_error, last_cell


@app.post("/api/execute")
def execute_notebook(req: ExecuteRequest):
    nb_path = safe_resolve(req.path)
    if nb_path.suffix.lower() != ".ipynb":
        raise HTTPException(status_code=400, detail="Not a .ipynb notebook")

    nb = nbformat.read(nb_path, as_version=4)

    # ✅ run in notebook folder so sibling .py imports work
    nb_dir = str(nb_path.parent)

    nb, run_error, last_cell = execute_nb_in_dir(nb, nb_dir, req.timeout)

    # Persist executed notebook for download (even if partial)
    persistent_dir = Path(tempfile.gettempdir()) / "ieor4703_executed"
    persistent_dir.mkdir(exist_ok=True)

    safe_name = req.path.replace("/", "__").replace("\\", "__")
    executed_path = persistent_dir / f"{safe_name}__executed.ipynb"
    nbformat.write(nb, executed_path)

    EXEC_CACHE[req.path] = str(executed_path)

    return {"notebook": nb, "error": run_error, "last_cell": last_cell}


@app.post("/api/execute_nb")
def execute_notebook_body(req: ExecuteNotebookBody):
    # Validate notebook object
    try:
        nb = nbformat.from_dict(req.notebook)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid notebook JSON: {e}")

    # Use the original notebook's folder as cwd
    nb_path = safe_resolve(req.path)
    if nb_path.suffix.lower() != ".ipynb":
        raise HTTPException(status_code=400, detail="Not a .ipynb notebook")

    nb_dir = str(nb_path.parent)

    nb, run_error, last_cell = execute_nb_in_dir(nb, nb_dir, req.timeout)

    # For edited notebooks we return the executed notebook directly
    return {"notebook": nb, "error": run_error, "last_cell": last_cell}


@app.get("/api/download")
def download(path: str, executed: int = 0):
    nb_path = safe_resolve(path)

    if executed:
        executed_path = EXEC_CACHE.get(path)
        if not executed_path or not Path(executed_path).exists():
            raise HTTPException(status_code=404, detail="No executed notebook available yet")
        return FileResponse(executed_path, filename=Path(executed_path).name)

    return FileResponse(nb_path, filename=nb_path.name)

@app.get("/api/data/preview")
def preview_data(path: str, max_rows: int = 200):
    """
    Return a JSON preview of a CSV/XLSX: columns + first N rows.
    """
    file_path = safe_resolve(path)
    ext = file_path.suffix.lower()

    if ext not in [".csv", ".xlsx", ".xls"]:
        raise HTTPException(status_code=400, detail="Not a CSV/XLSX file")

    try:
        if ext == ".csv":
            # more robust for common CSV quirks
            df = pd.read_csv(file_path)
        else:
            # .xlsx/.xls
            df = pd.read_excel(file_path)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read file: {e}")

    df = df.head(max_rows)

    # Replace NaNs with None for JSON
    data = df.where(pd.notnull(df), None).to_dict(orient="records")

    return {
        "columns": list(df.columns),
        "rows": data,
        "total_preview_rows": len(df),
        "truncated": len(df) >= max_rows,
    }


@app.get("/api/data/download")
def download_data(path: str):
    """
    Download a CSV/XLSX file.
    """
    file_path = safe_resolve(path)
    ext = file_path.suffix.lower()

    if ext not in [".csv", ".xlsx", ".xls", ".dat"]:
        raise HTTPException(status_code=400, detail="Not a CSV/XLSX file")

    return FileResponse(file_path, filename=file_path.name)

DIST_DIR = (Path(__file__).parent / "dist").resolve()

if DIST_DIR.exists():
    app.mount("/", StaticFiles(directory=DIST_DIR, html=True), name="static")

    @app.get("/{full_path:path}")
    def spa_fallback(full_path: str):
        return FileResponse(DIST_DIR / "index.html")
