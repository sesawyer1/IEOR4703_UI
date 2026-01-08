import ReactMarkdown from "react-markdown";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";

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

export default function NotebookViewer({ raw }: { raw: string }) {
  let nb: Notebook;

  try {
    nb = JSON.parse(raw);
  } catch {
    return <Typography color="error">Failed to parse notebook.</Typography>;
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {nb.cells.map((cell, i) => (
        <Paper key={i} sx={{ p: 2 }}>
          {cell.cell_type === "markdown" ? (
            <ReactMarkdown>{join(cell.source)}</ReactMarkdown>
          ) : cell.cell_type === "code" ? (
            <>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                Code{" "}
                {cell.execution_count != null
                  ? `• In [${cell.execution_count}]`
                  : ""}
              </Typography>

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

  // matplotlib PNG
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

  // matplotlib SVG
  if (data["image/svg+xml"]) {
    return (
      <div dangerouslySetInnerHTML={{ __html: join(data["image/svg+xml"]) }} />
    );
  }

  // HTML tables
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
