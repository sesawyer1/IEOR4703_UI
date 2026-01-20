import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import type { ContentFile } from "../data.type";
import ListItemIcon from "@mui/material/ListItemIcon";

const prettyLabel = (s: string) =>
  s
    .replace(/^(\d+)\./, "$1. ")
    .replace(/[_-]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();

const renderFiles = (
  files: ContentFile[] | undefined,
  depth: number,
  parentKey: string,
  onFileClick: (file: ContentFile) => void,
  selectedPath: string | null,
  rowSx: any,
  selectedRowSx: any
) => {
  if (!files?.length) return null;

  return files.map((f) => {
    const isSelected = selectedPath === f.path;

    return (
      <ListItemButton
        key={`${parentKey}/file:${f.name}`}
        sx={{
          ...(isSelected ? selectedRowSx : rowSx),
          pl: 2 + depth * 2,
          py: 1.05,
        }}
        onClick={() => onFileClick(f)}
      >
        <ListItemIcon sx={{ minWidth: 32 }}>
          <InsertDriveFileIcon fontSize="small" />
        </ListItemIcon>

        <ListItemText
          primary={prettyLabel(f.name)}
          secondary={f.ext}
          sx={{ my: 0, flex: 1, minWidth: 0 }} // ⭐ important for wrapping
          primaryTypographyProps={{
            sx: {
              whiteSpace: "normal",
              overflowWrap: "anywhere",
              wordBreak: "break-word",
              lineHeight: 1.2,
            },
          }}
        />
      </ListItemButton>
    );
  });
};

export { renderFiles };
