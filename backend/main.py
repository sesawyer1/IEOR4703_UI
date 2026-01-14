from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel
from pathlib import Path
import tempfile
import nbformat
from nbclient import NotebookClient

app = FastAPI()

# ---- CORS (Vite dev server) ----
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
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
    notebook: dict
    timeout: int = 120  # seconds


@app.post("/api/execute")
def execute_notebook(req: ExecuteRequest):
    nb_path = safe_resolve(req.path)
    if nb_path.suffix.lower() != ".ipynb":
        raise HTTPException(status_code=400, detail="Not a .ipynb notebook")

    nb = nbformat.read(nb_path, as_version=4)

    # Execute in an isolated temp working directory
    with tempfile.TemporaryDirectory() as tmpdir:
        client = NotebookClient(
            nb,
            timeout=req.timeout,
            kernel_name="python3",
            resources={"metadata": {"path": tmpdir}},
        )

        try:
            client.execute()
            run_error = None
        except Exception as e:
            # Return partial outputs + error string
            run_error = str(e)

        # Persist executed notebook for download (even if partial)
        persistent_dir = Path(tempfile.gettempdir()) / "ieor4703_executed"
        persistent_dir.mkdir(exist_ok=True)

        # Unique-ish name per notebook path
        safe_name = req.path.replace("/", "__").replace("\\", "__")
        executed_path = persistent_dir / f"{safe_name}__executed.ipynb"
        nbformat.write(nb, executed_path)

        EXEC_CACHE[req.path] = str(executed_path)

        return {"notebook": nb, "error": run_error}

@app.post("/api/execute_nb")
def execute_notebook_body(req: ExecuteNotebookBody):
    # Validate notebook object
    try:
        nb = nbformat.from_dict(req.notebook)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid notebook JSON: {e}")

    with tempfile.TemporaryDirectory() as tmpdir:
        client = NotebookClient(
            nb,
            timeout=req.timeout,
            kernel_name="python3",
            resources={"metadata": {"path": tmpdir}},
        )

        try:
            client.execute()
            run_error = None
        except Exception as e:
            run_error = str(e)

        # NOTE: for edited notebooks, we return the executed notebook directly.
        # Download can be handled client-side (downloadNotebook()).
        return {"notebook": nb, "error": run_error}

@app.get("/api/download")
def download(path: str, executed: int = 0):
    """
    Download original or last executed notebook.
    executed=0 -> original file
    executed=1 -> last executed output file (must have run at least once)
    """
    nb_path = safe_resolve(path)

    if executed:
        executed_path = EXEC_CACHE.get(path)
        if not executed_path or not Path(executed_path).exists():
            raise HTTPException(status_code=404, detail="No executed notebook available yet")
        return FileResponse(executed_path, filename=Path(executed_path).name)

    return FileResponse(nb_path, filename=nb_path.name)
