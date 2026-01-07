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
import { renderFiles } from "./side-bar.helpers";

type SideBarProps = {
  openMap: Record<string, boolean>;
  toggle: (key: string) => void;
  setSelectedFile: (file: ChapterFile) => void;
};

export const SideBar = ({ openMap, toggle, setSelectedFile }: SideBarProps) => {
  // TEST DATA
  const chapters: Chapter[] = [
    {
      id: 1,
      title: "Chapter 1 (files only)",
      files: [
        { name: "intro.pdf", size: 120000, type: "pdf" },
        { name: "notes.md", size: 5200, type: "markdown" },
      ],
    },
    {
      id: 2,
      title: "Chapter 2 (folders + nesting)",
      folders: [
        {
          name: "Week 1",
          files: [{ name: "slides.pptx", size: 2400000, type: "pptx" }],
          subfolders: [
            {
              name: "Readings",
              files: [
                { name: "paper1.pdf", size: 900000, type: "pdf" },
                { name: "paper2.pdf", size: 1100000, type: "pdf" },
              ],
              subfolders: [
                {
                  name: "Optional",
                  files: [{ name: "extra.pdf", size: 700000, type: "pdf" }],
                },
              ],
            },
            {
              name: "Homework",
              files: [{ name: "hw1.pdf", size: 80000, type: "pdf" }],
            },
          ],
        },
        {
          name: "Week 2 (empty folder)",
          files: [],
          subfolders: [],
        },
      ],
    },
    {
      id: 3,
      title: "Chapter 3 (folders only)",
      folders: [
        {
          name: "Project",
          subfolders: [
            {
              name: "Starter Code",
              files: [{ name: "main.ts", size: 3400, type: "typescript" }],
            },
          ],
        },
      ],
    },
  ];

  return (
    <List
      sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}
      component="nav"
      aria-labelledby="nested-list-subheader"
      subheader={
        <ListSubheader component="div" id="nested-list-subheader">
          Chapters
        </ListSubheader>
      }
    >
      {chapters.map((chapter) => {
        const chapterKey = `chapter:${chapter.id}`;
        const hasChildren =
          (chapter.files?.length ?? 0) > 0 ||
          (chapter.folders?.length ?? 0) > 0;

        const open = !!openMap[chapterKey];

        return (
          <div key={chapterKey}>
            {/* Chapter row */}
            <ListItemButton onClick={() => hasChildren && toggle(chapterKey)}>
              <ListItemText primary={chapter.title} />
              {hasChildren ? open ? <ExpandLess /> : <ExpandMore /> : null}
            </ListItemButton>

            {/* Chapter children */}
            {hasChildren && (
              <Collapse in={open} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {/* 1) chapter files */}
                  {renderFiles(chapter.files, 1, chapterKey, setSelectedFile)}

                  {/* 2) chapter folders (recursive) */}
                  {(chapter.folders ?? []).map((folder) => (
                    <ChapterLoop
                      key={`${chapterKey}/folder:${folder.name}`}
                      name={folder.name}
                      files={folder.files}
                      subfolders={folder.subfolders}
                      depth={1}
                      nodeKey={`${chapterKey}/folder:${folder.name}`}
                      openMap={openMap}
                      toggle={toggle}
                      setSelectedFile={setSelectedFile}
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
