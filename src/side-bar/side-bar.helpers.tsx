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
import type { Chapter, ChapterFile } from "../data.type";
import ListItemIcon from "@mui/material/ListItemIcon";

const renderFiles = (
  files: ChapterFile[] | undefined,
  depth: number,
  parentKey: string,
  setSelectedFile: (file: ChapterFile) => void
) => {
  if (!files?.length) return null;

  return files.map((f) => (
    <ListItemButton
      key={`${parentKey}/file:${f.name}`}
      sx={{ pl: 2 + depth * 2 }}
      onClick={() => {
        setSelectedFile(f);
      }}
    >
      <ListItemIcon>
        <InsertDriveFileIcon />
      </ListItemIcon>
      <ListItemText
        primary={f.name}
        secondary={`${f.type} • ${f.size} bytes`}
      />
    </ListItemButton>
  ));
};

export { renderFiles };
