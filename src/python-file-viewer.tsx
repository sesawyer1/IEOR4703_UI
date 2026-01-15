import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export default function PythonFileViewer({ code }: { code: string }) {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Python helper file
      </Typography>

      <Typography variant="body2" sx={{ opacity: 0.7, mb: 2 }}>
        This file is imported by notebooks and is not executed directly.
      </Typography>

      <Box
        component="pre"
        sx={{
          p: 2,
          bgcolor: "rgba(0,0,0,0.04)",
          borderRadius: 2,
          overflow: "auto",
          fontFamily:
            "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          fontSize: 13,
          lineHeight: 1.4,
        }}
      >
        {code}
      </Box>
    </Box>
  );
}
