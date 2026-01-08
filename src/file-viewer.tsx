import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import NotebookViewer from "./notebook-viewer";
import type { ContentFile } from "./data.type";

export default function FileViewer({ file }: { file: ContentFile }) {
  const ext = file.ext.toLowerCase();

  // 1) Jupyter notebooks
  if (ext === "ipynb") {
    if (!file.raw) {
      return <Typography color="error">Notebook content not found.</Typography>;
    }
    return <NotebookViewer raw={file.raw} />;
  }

  // 2) Images
  if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext)) {
    if (!file.url) {
      return <Typography color="error">Image URL not found.</Typography>;
    }
    return (
      <img
        src={file.url}
        alt={file.name}
        style={{ maxWidth: "100%", height: "auto" }}
      />
    );
  }

  // 3) Text / code files
  if (file.raw != null) {
    return (
      <Box
        component="pre"
        sx={{
          m: 0,
          p: 2,
          overflow: "auto",
          borderRadius: 1,
          bgcolor: "rgba(0,0,0,0.03)",
          fontFamily:
            "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          fontSize: 13,
        }}
      >
        {file.raw}
      </Box>
    );
  }

  // 4) Fallback (PDFs, etc.)
  if (file.url) {
    return (
      <Typography>
        Preview not available.{" "}
        <a href={file.url} target="_blank" rel="noreferrer">
          Open {file.name}
        </a>
      </Typography>
    );
  }

  return <Typography color="error">Unsupported file type.</Typography>;
}
