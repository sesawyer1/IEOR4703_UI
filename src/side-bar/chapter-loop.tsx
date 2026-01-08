import * as React from "react";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";

import FolderIcon from "@mui/icons-material/Folder";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";

import { renderFiles } from "./side-bar.helpers";
import type { ContentFile, ContentFolder } from "../data.type";

type ChapterLoopProps = {
  folder: ContentFolder;
  depth: number;
  nodeKey: string;
  openMap: Record<string, boolean>;
  toggle: (key: string) => void;
  onFileClick: (file: ContentFile) => void;
};

export default function ChapterLoop({
  folder,
  depth,
  nodeKey,
  openMap,
  toggle,
  onFileClick,
}: ChapterLoopProps) {
  const hasChildren =
    (folder.files?.length ?? 0) > 0 || (folder.folders?.length ?? 0) > 0;

  const open = !!openMap[nodeKey];

  return (
    <>
      {/* Folder row */}
      <ListItemButton
        sx={{ pl: 2 + depth * 2 }}
        onClick={() => hasChildren && toggle(nodeKey)}
      >
        <ListItemIcon>
          <FolderIcon />
        </ListItemIcon>

        <ListItemText
          primary={folder.name}
          primaryTypographyProps={{
            sx: {
              whiteSpace: "normal",
              overflowWrap: "anywhere",
              lineHeight: 1.2,
            },
          }}
        />

        {hasChildren ? open ? <ExpandLess /> : <ExpandMore /> : null}
      </ListItemButton>

      {/* Children */}
      {hasChildren && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {/* Files */}
            {renderFiles(folder.files, depth + 1, nodeKey, onFileClick)}

            {/* Subfolders (recursive) */}
            {(folder.folders ?? []).map((sub) => (
              <ChapterLoop
                key={`${nodeKey}/folder:${sub.name}`}
                folder={sub}
                depth={depth + 1}
                nodeKey={`${nodeKey}/folder:${sub.name}`}
                openMap={openMap}
                toggle={toggle}
                onFileClick={onFileClick}
              />
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
}
