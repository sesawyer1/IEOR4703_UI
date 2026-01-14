import { useState } from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Toolbar from "@mui/material/Toolbar";
import CssBaseline from "@mui/material/CssBaseline";
import AppBar from "@mui/material/AppBar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import TextField from "@mui/material/TextField";
import NotebookApiViewer from "./notebook-api-viewer";
import InputAdornment from "@mui/material/InputAdornment";

import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";

import { SideBar } from "./side-bar/side-bar";
import type { ContentFile } from "./data.type";
import { buildChapters } from "./content-index";

export default function App() {
  const chapters = buildChapters();
  console.log("chapters:", chapters);
  const [sidebarWidth, setSidebarWidth] = useState(320);

  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});

  const toggle = (key: string) => {
    setOpenMap((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // ADD BACKEND LATER
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedFile, setSelectedFile] = useState<ContentFile | null>(null);

  const handleHome = () => {
    setOpenMap({}); // closes all dropdowns
    setSearchOpen(false); // optional: close search bar
    setSearchQuery(""); // optional: clear search
    setSelectedFile(null); // deselect file
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* Header */}
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar sx={{ gap: 1 }}>
          {/* Home/reset */}
          <IconButton color="inherit" onClick={handleHome} edge="start">
            <HomeIcon />
          </IconButton>

          <Typography variant="h6" noWrap>
            IEOR 4703 Starter Codes
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          {/* Search toggle */}
          <IconButton
            color="inherit"
            onClick={() => setSearchOpen((v) => !v)}
            aria-label="toggle search"
          >
            {searchOpen ? <CloseIcon /> : <SearchIcon />}
          </IconButton>

          {/* Search bar */}
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

      {/* Sidebar */}
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
        {/* pushes sidebar content below the AppBar */}
        <Toolbar />
        <SideBar
          chapters={chapters}
          openMap={openMap}
          toggle={toggle}
          onFileClick={setSelectedFile}
        />
      </Drawer>
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

      {/* Main content area */}
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Toolbar />

        {/* Centered content container */}
        <Box
          sx={{
            maxWidth: 1100, // 👈 key
            mx: "auto", // 👈 center horizontally
            px: 3, // padding
            pb: 6,
            pt: 2,
          }}
        >
          {selectedFile ? (
            selectedFile.name.endsWith(".ipynb") ? (
              <NotebookApiViewer file={selectedFile} />
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
