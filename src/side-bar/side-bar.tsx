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

const prettyLabel = (s: string) =>
  s
    .replace(/^(\d+)\./, "$1. ")
    .replace(/[_-]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();

type SideBarProps = {
  chapters: Chapter[];
  openMap: Record<string, boolean>;
  toggle: (key: string) => void;
  onFileClick: (file: ContentFile) => void;
  selectedPath: string | null;
};

export const SideBar = ({
  openMap,
  toggle,
  onFileClick,
  chapters,
  selectedPath,
}: SideBarProps) => {
  const rowSx = {
    mx: 1,
    my: 0.25,
    borderRadius: 2,
    minWidth: 0,
    alignItems: "flex-start",
    "&:hover": {
      bgcolor: "rgba(0,0,0,0.04)",
    },
  };

  const chapterNumber = (title: string) => {
    const m = title.match(/^\s*(\d+)\s*\./);
    return m ? Number(m[1]) : Number.POSITIVE_INFINITY; // non-numbered go last
  };

  const sortedChapters = React.useMemo(() => {
    return [...chapters].sort((a, b) => {
      const na = chapterNumber(a.title);
      const nb = chapterNumber(b.title);

      // primary: numeric prefix
      if (na !== nb) return na - nb;

      // tie-breaker: consistent ordering if same/none
      return a.title.localeCompare(b.title);
    });
  }, [chapters]);

  const selectedRowSx = {
    ...rowSx,
    borderRadius: 999,
    bgcolor: "rgba(25, 118, 210, 0.12)",
    "&:hover": {
      bgcolor: "rgba(25, 118, 210, 0.18)",
    },
  };
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
      {sortedChapters.map((chapter) => {
        // chapter.id is already unique (e.g. "Data/1.LCG")
        const chapterKey = `chapter:${chapter.id}`;

        const hasChildren =
          (chapter.root.files?.length ?? 0) > 0 ||
          (chapter.root.folders?.length ?? 0) > 0;

        const open = !!openMap[chapterKey];

        return (
          <div key={chapterKey}>
            {/* Chapter row */}
            <ListItemButton
              onClick={() => hasChildren && toggle(chapterKey)}
              sx={{
                ...rowSx,
                py: 0.8,
                ...(open
                  ? { borderLeft: "4px solid rgba(25, 118, 210, 0.6)" }
                  : {}),
              }}
            >
              <ListItemText
                primary={prettyLabel(chapter.title)}
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

            {/* Chapter children */}
            {hasChildren && (
              <Collapse in={open} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {/* 1) chapter files */}
                  {renderFiles(
                    chapter.root.files,
                    1,
                    chapterKey,
                    onFileClick,
                    selectedPath,
                    rowSx,
                    selectedRowSx
                  )}

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
                      selectedPath={selectedPath}
                      rowSx={rowSx}
                      selectedRowSx={selectedRowSx}
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
