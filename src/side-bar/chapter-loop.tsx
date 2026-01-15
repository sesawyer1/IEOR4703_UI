import * as React from "react";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";

import FolderIcon from "@mui/icons-material/Folder";
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
  selectedPath: string | null;
  rowSx: any;
  selectedRowSx: any;
};

export default function ChapterLoop({
  folder,
  depth,
  nodeKey,
  openMap,
  toggle,
  onFileClick,
  selectedPath,
  rowSx,
  selectedRowSx,
}: ChapterLoopProps) {
  const hasChildren =
    (folder.files?.length ?? 0) > 0 || (folder.folders?.length ?? 0) > 0;

  const open = !!openMap[nodeKey];

  return (
    <>
      {/* Folder row */}
      <ListItemButton
        sx={{
          ...rowSx,
          pl: 2 + depth * 2,
          py: 1.0,
          ...(open ? { borderLeft: "4px solid rgba(25, 118, 210, 0.6)" } : {}),
        }}
        onClick={() => hasChildren && toggle(nodeKey)}
      >
        <ListItemIcon sx={{ minWidth: 32 }}>
          <FolderIcon fontSize="small" />
        </ListItemIcon>

        <ListItemText
          primary={folder.name}
          sx={{ my: 0, flex: 1, minWidth: 0 }}
          primaryTypographyProps={{
            sx: {
              whiteSpace: "normal",
              overflowWrap: "anywhere",
              wordBreak: "break-word",
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
            {renderFiles(
              folder.files,
              depth + 1,
              nodeKey,
              onFileClick,
              selectedPath,
              rowSx,
              selectedRowSx
            )}

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
                selectedPath={selectedPath}
                rowSx={rowSx}
                selectedRowSx={selectedRowSx}
              />
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
}
