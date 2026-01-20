import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export default function ImageFileViewer({ src }: { src: string }) {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Image preview
      </Typography>

      <Box
        component="img"
        src={src}
        alt=""
        sx={{
          maxWidth: "100%",
          maxHeight: "80vh",
          borderRadius: 1,
          border: "1px solid rgba(0,0,0,0.1)",
        }}
      />
    </Box>
  );
}
