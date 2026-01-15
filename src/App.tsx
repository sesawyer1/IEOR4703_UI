import { useEffect, useMemo, useState } from "react";

import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Toolbar from "@mui/material/Toolbar";
import CssBaseline from "@mui/material/CssBaseline";
import AppBar from "@mui/material/AppBar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";

import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";

import { SideBar } from "./side-bar/side-bar";
import NotebookApiViewer from "./notebook-api-viewer";
import type { ContentFile } from "./data.type";
import { buildChapters } from "./content-index";
import { filterChapters } from "./side-bar/search.helpers";
import PythonApiViewer from "./python-api-viewer";

export default function App() {
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState<ContentFile | null>(null);

  const toggle = (key: string) => {
    setOpenMap((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleHome = () => {
    setOpenMap({});
    setSearchOpen(false);
    setSearchQuery("");
    setSelectedFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Build once (or when the underlying index changes)
  const allChapters = useMemo(() => buildChapters(), []);

  // Filter whenever searchQuery changes
  const { filteredChapters, openKeys } = useMemo(() => {
    return filterChapters(allChapters, searchQuery);
  }, [allChapters, searchQuery]);

  // Auto-open keys that contain matches
  useEffect(() => {
    if (!searchQuery.trim()) return;

    setOpenMap((prev) => {
      const next = { ...prev };
      for (const k of openKeys) next[k] = true;
      return next;
    });
  }, [searchQuery, openKeys]);

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      <AppBar
        position="fixed"
        sx={{
          bgcolor: "#C6E6F5",
          color: "#0D3B66",
          zIndex: (t) => t.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ gap: 1 }}>
          <IconButton color="inherit" onClick={handleHome} edge="start">
            <HomeIcon />
          </IconButton>

          <Typography variant="h6" noWrap>
            IEOR 4703 Starter Codes
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          <IconButton
            color="inherit"
            onClick={() => setSearchOpen((v) => !v)}
            aria-label="toggle search"
          >
            {searchOpen ? <CloseIcon /> : <SearchIcon />}
          </IconButton>

          <Collapse in={searchOpen} orientation="horizontal" timeout={200}>
            <Box sx={{ ml: 1, width: 280 }}>
              <TextField
                size="small"
                placeholder="Search…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Collapse>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: sidebarWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: sidebarWidth,
            boxSizing: "border-box",
            overflowX: "hidden",
          },
        }}
      >
        <Toolbar />
        <SideBar
          chapters={filteredChapters}
          openMap={openMap}
          toggle={toggle}
          onFileClick={setSelectedFile}
          selectedPath={selectedFile?.path ?? null}
        />
      </Drawer>

      {/* resize handle */}
      <Box
        sx={{
          width: 6,
          cursor: "col-resize",
          bgcolor: "transparent",
          "&:hover": { bgcolor: "rgba(0,0,0,0.08)" },
        }}
        onMouseDown={(e) => {
          e.preventDefault();
          const startX = e.clientX;
          const startWidth = sidebarWidth;

          const onMove = (ev: MouseEvent) => {
            const next = Math.min(
              520,
              Math.max(240, startWidth + (ev.clientX - startX))
            );
            setSidebarWidth(next);
          };

          const onUp = () => {
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
          };

          window.addEventListener("mousemove", onMove);
          window.addEventListener("mouseup", onUp);
        }}
      />

      <Box component="main" sx={{ flexGrow: 1 }}>
        <Toolbar />

        <Box sx={{ maxWidth: 1100, mx: "auto", px: 3, pb: 6, pt: 2 }}>
          {selectedFile ? (
            selectedFile.name.endsWith(".ipynb") ? (
              <NotebookApiViewer file={selectedFile} />
            ) : selectedFile.name.endsWith(".py") ? (
              <PythonApiViewer file={selectedFile} />
            ) : (
              <Typography sx={{ opacity: 0.7 }}>
                Selected file: {selectedFile.name}
              </Typography>
            )
          ) : (
            <Box sx={{ mt: 6 }}>
              <Typography variant="h3" fontWeight="bold" gutterBottom>
                IEOR 4703: Monte Carlo Simulations
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.75 }}>
                Select a chapter and file from the sidebar to get started.
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
