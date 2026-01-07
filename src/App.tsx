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
import InputAdornment from "@mui/material/InputAdornment";

import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";

import { SideBar } from "./side-bar/side-bar";
import type { ChapterFile } from "./data.type";

const drawerWidth = 320;

export default function App() {
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});

  const toggle = (key: string) => {
    setOpenMap((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // ADD BACKEND LATER
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedFile, setSelectedFile] = useState<ChapterFile | null>(null);

  const handleHome = () => {
    setOpenMap({});        // closes all dropdowns
    setSearchOpen(false);  // optional: close search bar
    setSearchQuery("");    // optional: clear search
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
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        {/* pushes sidebar content below the AppBar */}
        <Toolbar />
        <SideBar openMap={openMap} toggle={toggle} setSelectedFile={setSelectedFile} />
      </Drawer>

      {/* Main content area */}
      <Box component="main" sx={{ flexGrow: 1, p: 2 }}>
        {/* pushes main content below the AppBar */}
        <Toolbar />

        {/* Replace this with your routes/pages later */}
        <div>{selectedFile ? `Selected file: ${selectedFile.name}` : "No file selected"}</div>

        {/* Temporary debug (optional) */}
        {/* <pre>{JSON.stringify({ searchQuery }, null, 2)}</pre> */}
      </Box>
    </Box>
  );
}
