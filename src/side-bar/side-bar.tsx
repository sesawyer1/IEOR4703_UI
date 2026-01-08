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
import { renderFiles } from "./side-bar.helpers";

type SideBarProps = {
  chapters: Chapter[];
  openMap: Record<string, boolean>;
  toggle: (key: string) => void;
  onFileClick: (file: ContentFile) => void;
};

export const SideBar = ({
  openMap,
  toggle,
  onFileClick,
  chapters,
}: SideBarProps) => {
  return (
    <List
      sx={{ width: "100%", bgcolor: "background.paper" }} // remove maxWidth so Drawer controls width
      component="nav"
      aria-labelledby="nested-list-subheader"
      subheader={
        <ListSubheader component="div" id="nested-list-subheader">
          Chapters
        </ListSubheader>
      }
    >
      {chapters.map((chapter) => {
        // chapter.id is already unique (e.g. "Data/1.LCG")
        const chapterKey = `chapter:${chapter.id}`;

        const hasChildren =
          (chapter.root.files?.length ?? 0) > 0 ||
          (chapter.root.folders?.length ?? 0) > 0;

        const open = !!openMap[chapterKey];

        return (
          <div key={chapterKey}>
            {/* Chapter row */}
            <ListItemButton onClick={() => hasChildren && toggle(chapterKey)}>
              <ListItemText
                primary={chapter.title}
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

            {/* Chapter children */}
            {hasChildren && (
              <Collapse in={open} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {/* 1) chapter files */}
                  {renderFiles(chapter.root.files, 1, chapterKey, onFileClick)}

                  {/* 2) chapter folders (recursive) */}
                  {(chapter.root.folders ?? []).map((folder) => (
                    <ChapterLoop
                      key={`${chapterKey}/folder:${folder.name}`}
                      folder={folder}
                      depth={1}
                      nodeKey={`${chapterKey}/folder:${folder.name}`}
                      openMap={openMap}
                      toggle={toggle}
                      onFileClick={onFileClick}
                    />
                  ))}
                </List>
              </Collapse>
            )}
          </div>
        );
      })}
    </List>
  );
};
