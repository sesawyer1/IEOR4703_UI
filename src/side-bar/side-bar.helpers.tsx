import React, { useState } from "react";
import ListSubheader from "@mui/material/ListSubheader";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";

import ChapterLoop from "./chapter-loop";
import type { Chapter, ContentFile } from "../data.type";
import ListItemIcon from "@mui/material/ListItemIcon";

const renderFiles = (
  files: ContentFile[] | undefined,
  depth: number,
  parentKey: string,
  onFileClick: (file: ContentFile) => void
) => {
  if (!files?.length) return null;

  return files.map((f) => (
    <ListItemButton
      key={`${parentKey}/file:${f.name}`}
      sx={{ pl: 2 + depth * 2 }}
      onClick={() => onFileClick(f)}
    >
      <ListItemIcon>
        <InsertDriveFileIcon />
      </ListItemIcon>
      <ListItemText
        primary={f.name}
        secondary={f.ext}
        primaryTypographyProps={{
          sx: {
            whiteSpace: "normal",
            overflowWrap: "anywhere",
            lineHeight: 1.2,
          },
        }}
      />
    </ListItemButton>
  ));
};

export { renderFiles };
