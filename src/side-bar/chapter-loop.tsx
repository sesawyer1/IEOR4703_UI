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
import type { ChapterFile, Folder } from "../data.type";

type ChapterLoopProps = {
  name: string;
  files?: ChapterFile[];
  subfolders?: Folder[];
  depth: number;
  nodeKey: string;
  openMap: Record<string, boolean>;
  selectedFile?: ChapterFile | null;
  toggle: (key: string) => void;
  setSelectedFile?: (file: ChapterFile) => void;
};

const ChapterLoop: React.FC<ChapterLoopProps> = ({
  name,
  files,
  subfolders,
  depth,
  nodeKey,
  openMap,
  toggle,
  selectedFile,
  setSelectedFile,
}) => {
  const hasChildren =
    (files?.length ?? 0) > 0 || (subfolders?.length ?? 0) > 0;

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

        <ListItemText primary={name} />

        {hasChildren ? open ? <ExpandLess /> : <ExpandMore /> : null}
      </ListItemButton>

      {/* Children */}
      {hasChildren && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {/* Files */}
            {renderFiles(files, depth + 1, nodeKey, setSelectedFile!)}

            {/* Subfolders (recursive) */}
            {(subfolders ?? []).map((folder) => (
              <ChapterLoop
                key={`${nodeKey}/folder:${folder.name}`}
                name={folder.name}
                files={folder.files}
                subfolders={folder.subfolders}
                depth={depth + 1}
                nodeKey={`${nodeKey}/folder:${folder.name}`}
                openMap={openMap}
                toggle={toggle}
                setSelectedFile={setSelectedFile}
                selectedFile={selectedFile} 
              />
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
};

export default ChapterLoop;





