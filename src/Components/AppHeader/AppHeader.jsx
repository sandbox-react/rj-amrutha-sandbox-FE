import React, { useMemo, useState } from "react";
import {
  AppBar,
  Box,
  IconButton,
  InputBase,
  Stack,
  Toolbar,
  Typography,
  Badge,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useLocation, useNavigate } from "react-router-dom";
import { flattenMenuItems } from "../MenuItems/MenuItems";

const colors = {
  pageBg: "#f5f2f4",
  heading: "#6f1738",
  breadcrumbText: "#b06f2a",
  searchBg: "#f8f3f6",
  searchBorder: "#e7d9e2",
  iconBorder: "#e7d9e2",
  iconColor: "#8a5574",
  white: "#ffffff",
};

const AppHeader = ({ onMenuClick }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");

  const currentItem = useMemo(() => {
    const exact = flattenMenuItems.find((item) => item.path === location.pathname);
    if (exact) return exact;

    return flattenMenuItems.find((item) => {
      if (item.path === "/") return location.pathname === "/";
      return location.pathname.startsWith(item.path);
    });
  }, [location.pathname]);

  const pageTitle = currentItem?.label || "Dashboard";

  // 🔥 SEARCH NAVIGATION LOGIC
  const handleSearch = () => {
    if (!search.trim()) return;

    const query = search.toLowerCase();

    const found = flattenMenuItems.find((item) =>
      item.label.toLowerCase().includes(query)
    );

    if (found) {
      navigate(found.path);
      setSearch("");
    }
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: colors.pageBg,
        borderBottom: "1px solid #eadfe5",
        color: colors.heading,
      }}
    >
      <Toolbar
        sx={{
          minHeight: { xs: 64, md: 70 },
          px: { xs: 1.5, sm: 2.5, md: 3 },
          display: "flex",
          justifyContent: "space-between",
          gap: 1.5,
          flexWrap: { xs: "wrap", md: "nowrap" },
        }}
      >
        {/* LEFT */}
        <Stack direction="row" spacing={1.2} alignItems="center">
          <IconButton
            onClick={onMenuClick}
            sx={{
              display: { lg: "none" },
              width: 40,
              height: 40,
              border: `1px solid ${colors.iconBorder}`,
              bgcolor: colors.white,
            }}
          >
            <MenuIcon fontSize="small" />
          </IconButton>

          <Box>
            <Typography sx={{ fontSize: 26, fontFamily: "serif" }}>
              {pageTitle}
            </Typography>

            <Stack direction="row" spacing={0.5}>
              <Typography sx={{ fontSize: 13, color: colors.breadcrumbText }}>
                Amrutha Admin
              </Typography>
              <ChevronRightIcon sx={{ fontSize: 14 }} />
              <Typography sx={{ fontSize: 13, color: "#d08a1d" }}>
                {pageTitle}
              </Typography>
            </Stack>
          </Box>
        </Stack>

        {/* RIGHT */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* SEARCH */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              px: 1.5,
              width: 260,
              height: 40,
              borderRadius: 2,
              bgcolor: colors.searchBg,
              border: `1px solid ${colors.searchBorder}`,
            }}
          >
            <SearchOutlinedIcon
              sx={{ color: colors.iconColor, cursor: "pointer" }}
              onClick={handleSearch}
            />

            <InputBase
              placeholder="Search pages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
              sx={{
                ml: 1,
                flex: 1,
                fontSize: 14,
              }}
            />
          </Box>

          {/* NOTIFICATION */}
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: colors.white,
              border: `1px solid ${colors.iconBorder}`,
              display: "grid",
              placeItems: "center",
            }}
          >
            <Badge color="error" variant="dot">
              <NotificationsNoneOutlinedIcon />
            </Badge>
          </Box>

          {/* USER */}
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: colors.white,
              border: `1px solid ${colors.iconBorder}`,
              display: "grid",
              placeItems: "center",
            }}
          >
            <PersonOutlineOutlinedIcon />
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default AppHeader;