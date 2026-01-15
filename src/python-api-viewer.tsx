import { useEffect, useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import PythonFileViewer from "./python-file-viewer";
import type { ContentFile } from "./data.type";

export default function PythonApiViewer({ file }: { file: ContentFile }) {
  const [code, setCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCode(null);
    setError(null);

    fetch(`/${file.path}`)
      .then(async (r) => {
        if (!r.ok) throw new Error(await r.text());
        return r.text();
      })
      .then(setCode)
      .catch((e) => setError(String(e)));
  }, [file.path]);

  if (error) return <Typography color="error">{error}</Typography>;
  if (!code) return <CircularProgress />;

  return <PythonFileViewer code={code} />;
}
