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

  // table mode (csv/xlsx)
  const [columns, setColumns] = useState<string[]>([]);
  const [rows, setRows] = useState<any[]>([]);
  const [truncated, setTruncated] = useState(false);

  // text mode (.dat)
  const [textPreview, setTextPreview] = useState<string>("");

  const encodedPath = useMemo(() => encodeURIComponent(file.path), [file.path]);
  const downloadUrl = `${API_BASE}/api/data/download?path=${encodedPath}`;
  const previewUrl = `${API_BASE}/api/data/preview?path=${encodedPath}&max_rows=200`;

  const isDat = file.name.toLowerCase().endsWith(".dat");

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    // reset
    setColumns([]);
    setRows([]);
    setTruncated(false);
    setTextPreview("");

    const run = async () => {
      try {
        if (isDat) {
          // ✅ .dat = render as text by downloading it
          const r = await fetch(downloadUrl);
          if (!r.ok) throw new Error(await r.text());

          const txt = await r.text();
          if (cancelled) return;

          const MAX_CHARS = 200_000;
          setTextPreview(txt.length > MAX_CHARS ? txt.slice(0, MAX_CHARS) : txt);
          setTruncated(txt.length > MAX_CHARS);
          return;
        }

        // ✅ csv/xlsx = backend preview -> table
        const r = await fetch(previewUrl);
        if (!r.ok) throw new Error(await r.text());

        const data = await r.json();
        if (cancelled) return;

        setColumns(data.columns ?? []);
        setRows(data.rows ?? []);
        setTruncated(Boolean(data.truncated));
      } catch (e) {
        if (!cancelled) setError(String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [isDat, downloadUrl, previewUrl]);

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
      {error && <Typography color="error">Error: {error}</Typography>}

      {!loading && !error && (
        <>
          {truncated && (
            <Typography sx={{ opacity: 0.7, mb: 1 }}>
              Preview truncated…
            </Typography>
          )}

          {isDat ? (
            <Box
              sx={{
                border: "1px solid rgba(0,0,0,0.12)",
                borderRadius: 1,
                overflow: "auto",
                maxHeight: "70vh",
                p: 2,
                fontFamily:
                  "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                fontSize: 13,
                lineHeight: 1.5,
                whiteSpace: "pre",
              }}
            >
              {textPreview || "(empty file)"}
            </Box>
          ) : (
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
                          {row?.[c] == null ? "" : String(row[c])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
