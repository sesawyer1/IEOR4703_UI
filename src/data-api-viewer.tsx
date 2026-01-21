import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { API_BASE } from "./api";
import type { ContentFile } from "./data.type";

export default function DataApiViewer({ file }: { file: ContentFile }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [columns, setColumns] = useState<string[]>([]);
  const [rows, setRows] = useState<any[]>([]);
  const [truncated, setTruncated] = useState(false);

  const encodedPath = useMemo(() => encodeURIComponent(file.path), [file.path]);

  const downloadUrl = `${API_BASE}/api/data/download?path=${encodedPath}`;
  const previewUrl = `${API_BASE}/api/data/preview?path=${encodedPath}&max_rows=200`;

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);
    setColumns([]);
    setRows([]);
    setTruncated(false);

    fetch(previewUrl)
      .then(async (r) => {
        if (!r.ok) throw new Error(await r.text());
        return r.json();
      })
      .then((data) => {
        if (cancelled) return;
        setColumns(data.columns ?? []);
        setRows(data.rows ?? []);
        setTruncated(Boolean(data.truncated));
      })
      .catch((e) => {
        if (!cancelled) setError(String(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [previewUrl]);

  return (
    <Box>
      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap" }}>
        <Button
          variant="outlined"
          component="a"
          href={downloadUrl}
          target="_blank"
          rel="noreferrer"
        >
          Download
        </Button>
      </Stack>

      {loading && <CircularProgress />}
      {error && <Typography color="error">{error}</Typography>}

      {!loading && !error && (
        <>
          {truncated && (
            <Typography sx={{ opacity: 0.7, mb: 1 }}>
              Showing first 200 rows…
            </Typography>
          )}

          <Box
            sx={{
              border: "1px solid rgba(0,0,0,0.12)",
              borderRadius: 1,
              overflow: "auto",
              maxHeight: "70vh",
            }}
          >
            <table style={{ borderCollapse: "collapse", width: "100%" }}>
              <thead>
                <tr>
                  {columns.map((c) => (
                    <th
                      key={c}
                      style={{
                        position: "sticky",
                        top: 0,
                        background: "white",
                        textAlign: "left",
                        padding: "8px",
                        borderBottom: "1px solid rgba(0,0,0,0.12)",
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={idx}>
                    {columns.map((c) => (
                      <td
                        key={c}
                        style={{
                          padding: "8px",
                          borderBottom: "1px solid rgba(0,0,0,0.06)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {row?.[c] === null || row?.[c] === undefined
                          ? ""
                          : String(row[c])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        </>
      )}
    </Box>
  );
}
