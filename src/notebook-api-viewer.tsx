import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";

import { API_BASE } from "./api";
import NotebookViewer from "./notebook-viewer";
import type { ContentFile } from "./data.type";

function deepCopy<T>(obj: T): T {
  // structuredClone is great but not supported everywhere; JSON copy is fine for notebook JSON
  return JSON.parse(JSON.stringify(obj));
}

function downloadNotebook(nbObj: any, filename: string) {
  const blob = new Blob([JSON.stringify(nbObj, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function NotebookApiViewer({ file }: { file: ContentFile }) {
  const [nb, setNb] = useState<any | null>(null);
  const [draftNb, setDraftNb] = useState<any | null>(null);
  const [editMode, setEditMode] = useState(false);

  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [runError, setRunError] = useState<string | null>(null);

  const encodedPath = encodeURIComponent(file.path);

  // Load notebook from backend when selected file changes
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    setRunError(null);
    setNb(null);
    setDraftNb(null);
    setEditMode(false);

    fetch(`${API_BASE}/api/notebook?path=${encodedPath}`)
      .then(async (r) => {
        if (!r.ok) throw new Error(await r.text());
        return r.json();
      })
      .then((data) => {
        if (cancelled) return;
        setNb(data);
        setDraftNb(deepCopy(data)); // editable copy
      })
      .catch((e) => {
        if (!cancelled) setLoadError(String(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [file.path]);

  const runNotebook = async () => {
    setRunning(true);
    setRunError(null);

    try {
      const isEditing = editMode && draftNb;

      const url = isEditing
        ? `${API_BASE}/api/execute_nb`
        : `${API_BASE}/api/execute`;
      const body = isEditing
        ? { notebook: draftNb, timeout: 120 }
        : { path: file.path, timeout: 120 };

      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await r.json();

      // Update view + draft to the executed result
      setNb(data.notebook);
      setDraftNb(deepCopy(data.notebook));

      if (data.error) setRunError(data.error);
    } catch (e) {
      setRunError(String(e));
    } finally {
      setRunning(false);
    }
  };

  // Edit handler passed down to NotebookViewer
  const onChangeCellSource = (cellIndex: number, newSource: string) => {
    setDraftNb((prev: any) => {
      if (!prev?.cells?.[cellIndex]) return prev;
      const next = deepCopy(prev);

      // Jupyter accepts string OR string[]; we keep it as string for simplicity
      next.cells[cellIndex].source = newSource;

      return next;
    });
  };

  const downloadOriginalUrl = `${API_BASE}/api/download?path=${encodedPath}&executed=0`;

  const displayNb = editMode ? draftNb : nb;

  return (
    <Box>
      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap" }}>
        <Button
          variant="contained"
          onClick={runNotebook}
          disabled={loading || running}
        >
          {running ? "Running…" : "Run"}
        </Button>

        <Button
          variant={editMode ? "contained" : "outlined"}
          onClick={() => setEditMode((v) => !v)}
          disabled={!draftNb}
        >
          {editMode ? "Original mode" : "Edit mode"}
        </Button>

        <Button
          variant="outlined"
          component="a"
          href={downloadOriginalUrl}
          target="_blank"
          rel="noreferrer"
        >
          Download original
        </Button>

        <Button
          variant="outlined"
          disabled={!draftNb}
          onClick={() =>
            downloadNotebook(
              draftNb,
              file.name.replace(/\.ipynb$/i, "") +
                (editMode ? "_edited.ipynb" : "_current.ipynb")
            )
          }
        >
          {editMode ? "Download edited" : "Download current"}
        </Button>
      </Stack>

      {loading && <CircularProgress />}
      {loadError && (
        <Typography color="error">Load error: {loadError}</Typography>
      )}
      {runError && <Typography color="error">Run error: {runError}</Typography>}

      {displayNb && (
        <NotebookViewer
          nb={displayNb}
          editMode={editMode}
          onChangeCellSource={onChangeCellSource}
        />
      )}
    </Box>
  );
}
