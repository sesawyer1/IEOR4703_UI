import ReactMarkdown from "react-markdown";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import CodeIcon from "@mui/icons-material/Code";
import NotesIcon from "@mui/icons-material/Notes";

type NBCell = {
  cell_type: "markdown" | "code" | string;
  source?: string[] | string;
  outputs?: NBOutput[];
  execution_count?: number | null;
};

type NBOutput =
  | {
      output_type: "stream";
      name?: "stdout" | "stderr";
      text?: string[] | string;
    }
  | {
      output_type: "execute_result" | "display_data";
      data?: Record<string, any>;
    }
  | {
      output_type: "error";
      ename?: string;
      evalue?: string;
      traceback?: string[];
    };

type Notebook = { cells: NBCell[] };

const join = (v: string[] | string | undefined) =>
  Array.isArray(v) ? v.join("") : (v ?? "");

const joinB64 = (v: string[] | string | undefined) =>
  join(v).replace(/\n/g, "");

export default function NotebookViewer({
  nb,
  editMode,
  onChangeCellSource,
  onInsertBelow,
  onDeleteCell,
}: {
  nb: Notebook;
  editMode: boolean;
  onChangeCellSource: (cellIndex: number, newSource: string) => void;
  onInsertBelow: (index: number, kind: "code" | "markdown") => void;
  onDeleteCell: (index: number) => void;
}) {
  if (!nb || !Array.isArray(nb.cells)) {
    return <Typography color="error">Invalid notebook format.</Typography>;
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {nb.cells.map((cell, i) => (
        <Paper key={i} sx={{ p: 2 }}>
          {editMode && (
            <Stack
              direction="row"
              spacing={0.5}
              alignItems="center"
              sx={{ mb: 1, justifyContent: "flex-end" }}
            >
              <IconButton
                size="small"
                onClick={() => onInsertBelow(i, "code")}
                title="Insert code cell below"
              >
                <AddIcon fontSize="small" />
                <CodeIcon fontSize="small" />
              </IconButton>

              <IconButton
                size="small"
                onClick={() => onInsertBelow(i, "markdown")}
                title="Insert markdown cell below"
              >
                <AddIcon fontSize="small" />
                <NotesIcon fontSize="small" />
              </IconButton>

              <IconButton
                size="small"
                onClick={() => onDeleteCell(i)}
                title="Delete cell"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Stack>
          )}

          {cell.cell_type === "markdown" ? (
            editMode ? (
              <TextField
                multiline
                minRows={3}
                value={join(cell.source)}
                onChange={(e) => onChangeCellSource(i, e.target.value)}
                fullWidth
              />
            ) : (
              <ReactMarkdown>{join(cell.source)}</ReactMarkdown>
            )
          ) : cell.cell_type === "code" ? (
            <>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                Code{" "}
                {cell.execution_count != null
                  ? `• In [${cell.execution_count}]`
                  : ""}
              </Typography>

              {editMode ? (
                <TextField
                  multiline
                  minRows={3}
                  value={join(cell.source)}
                  onChange={(e) => onChangeCellSource(i, e.target.value)}
                  fullWidth
                  inputProps={{
                    style: {
                      fontFamily:
                        "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                      fontSize: 13,
                    },
                  }}
                  sx={{ mt: 1 }}
                />
              ) : (
                <Box
                  component="pre"
                  sx={{
                    m: 0,
                    mt: 1,
                    p: 1,
                    overflow: "auto",
                    borderRadius: 1,
                    bgcolor: "rgba(0,0,0,0.03)",
                    fontFamily:
                      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                    fontSize: 13,
                  }}
                >
                  {join(cell.source)}
                </Box>
              )}

              {(cell.outputs?.length ?? 0) > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Outputs outputs={cell.outputs ?? []} />
                </>
              )}
            </>
          ) : (
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              Unsupported cell type
            </Typography>
          )}
        </Paper>
      ))}
    </Box>
  );
}

function Outputs({ outputs }: { outputs: NBOutput[] }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      {outputs.map((out, i) => (
        <OutputItem key={i} out={out} />
      ))}
    </Box>
  );
}

function OutputItem({ out }: { out: NBOutput }) {
  if (out.output_type === "stream") {
    return <pre>{join(out.text)}</pre>;
  }

  if (out.output_type === "error") {
    return <pre style={{ color: "red" }}>{join(out.traceback)}</pre>;
  }

  const data = (out as any).data ?? {};

  if (data["image/png"]) {
    const b64 = joinB64(data["image/png"]);
    return (
      <img
        src={`data:image/png;base64,${b64}`}
        alt="plot"
        style={{
          maxWidth: "100%",
          height: "auto",
          display: "block",
          margin: "0 auto",
        }}
      />
    );
  }

  if (data["image/svg+xml"]) {
    return (
      <div dangerouslySetInnerHTML={{ __html: join(data["image/svg+xml"]) }} />
    );
  }

  if (data["text/html"]) {
    return (
      <div dangerouslySetInnerHTML={{ __html: join(data["text/html"]) }} />
    );
  }

  if (data["text/plain"]) {
    return <pre>{join(data["text/plain"])}</pre>;
  }

  return null;
}
