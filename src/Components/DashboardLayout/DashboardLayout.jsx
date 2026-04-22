import React, { useState } from "react";
import { Box, Toolbar } from "@mui/material";
import { Outlet } from "react-router-dom";
import AppSidebar, { drawerWidth } from "../AppSidebar/AppSidebar";
import AppHeader from "../AppHeader/AppHeader";


const DashboardLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f4f1f2" }}>
      <AppSidebar mobileOpen={mobileOpen} onClose={handleDrawerToggle} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { lg: `calc(100% - ${drawerWidth}px)` },
          minHeight: "100vh",
          bgcolor: "#f4f1f2",
        }}
      >
        <AppHeader onMenuClick={handleDrawerToggle} />
        <Toolbar sx={{ display: { xs: "none", lg: "none" } }} />

        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;