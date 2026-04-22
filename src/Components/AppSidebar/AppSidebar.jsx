import React from "react";
import {
  Avatar,
  Box,
  Chip,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { menuSections } from "../MenuItems/MenuItems";

export const drawerWidth = 220;

const colors = {
  sidebarBg: "#3a002b",
  sidebarCard: "#4d143d",
  activeBg:
    "linear-gradient(90deg, rgba(226,169,46,0.18) 0%, rgba(91,26,67,1) 100%)",
  activeBorder: "#e2a92e",
  textPrimary: "#f3d9a5",
  textSecondary: "#d4bfd0",
  sectionText: "#b98967",
  iconMuted: "#b79cab",
  badgeGold: "#f0ab2e",
  badgeRed: "#ef5b4c",
  divider: "rgba(226, 169, 46, 0.12)",
  hoverBg: "rgba(255,255,255,0.06)",
};

const isPathActive = (pathname, itemPath) => {
  if (itemPath === "/") return pathname === "/";
  if (itemPath === "/logout") return false;
  return pathname.startsWith(itemPath);
};

const SidebarContent = ({ onItemClick }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleItemClick = (item) => {
    if (item.path === "/logout") {
      localStorage.clear();
      sessionStorage.clear();

      window.location.replace("/login"); // reloads + replaces history

      if (onItemClick) onItemClick();
      return;
    }

    navigate(item.path);
    if (onItemClick) onItemClick();
  };

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: colors.sidebarBg,
        color: colors.textPrimary,
      }}
    >
      <Toolbar
        sx={{
          minHeight: "78px !important",
          px: 2,
          display: "flex",
          alignItems: "center",
          borderBottom: `1px solid ${colors.divider}`,
        }}
      >
        <Stack direction="row" spacing={1.2} alignItems="center">
          <Avatar
            sx={{
              width: 38,
              height: 38,
              bgcolor: "rgba(226,169,46,0.08)",
              color: colors.activeBorder,
              border: `1.5px solid ${colors.activeBorder}`,
              fontWeight: 700,
              fontSize: 20,
              fontFamily: "serif",
              boxShadow: "0 4px 12px rgba(0,0,0,0.16)",
            }}
          >
            A
          </Avatar>

          <Box>
            <Typography
              sx={{
                fontSize: 17,
                fontWeight: 600,
                color: colors.textPrimary,
                lineHeight: 1.1,
                fontFamily: "serif",
              }}
            >
              Amrutha
            </Typography>
            <Typography
              sx={{
                mt: 0.2,
                fontSize: 9.5,
                letterSpacing: 2,
                color: colors.activeBorder,
                textTransform: "uppercase",
              }}
            >
              Admin Portal
            </Typography>
          </Box>
        </Stack>
      </Toolbar>

      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          px: 1.1,
          py: 1.5,
        }}
      >
        {menuSections.map((group) => (
          <Box key={group.section} sx={{ mb: 2 }}>
            <Typography
              sx={{
                px: 1,
                mb: 1,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: colors.sectionText,
              }}
            >
              {group.section}
            </Typography>

            <List disablePadding sx={{ display: "grid", gap: 0.6 }}>
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isPathActive(location.pathname, item.path);
                const isLogout = item.path === "/logout";

                return (
                  <ListItemButton
                    key={item.path}
                    onClick={() => handleItemClick(item)}
                    sx={{
                      minHeight: 42,
                      borderRadius: 2.5,
                      px: 1.1,
                      py: 0.55,
                      mx: 0.2,
                      background: active ? colors.activeBg : "transparent",
                      border: active
                        ? `1px solid rgba(226,169,46,0.32)`
                        : "1px solid transparent",
                      boxShadow: active
                        ? "0 8px 18px rgba(0,0,0,0.16)"
                        : "none",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        bgcolor: colors.hoverBg,
                        transform: "translateX(3px)",
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 32,
                      }}
                    >
                      <Box
                        sx={{
                          width: 26,
                          height: 26,
                          borderRadius: 1.8,
                          display: "grid",
                          placeItems: "center",
                          bgcolor: active
                            ? "rgba(226,169,46,0.16)"
                            : "rgba(255,255,255,0.04)",
                        }}
                      >
                        <Icon
                          sx={{
                            color: active
                              ? colors.activeBorder
                              : isLogout
                                ? "#f09a8d"
                                : colors.iconMuted,
                            fontSize: 16,
                          }}
                        />
                      </Box>
                    </ListItemIcon>

                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontSize: 13,
                        fontWeight: active ? 700 : 500,
                        color: active
                          ? colors.textPrimary
                          : isLogout
                            ? "#f1b1a6"
                            : colors.textSecondary,
                      }}
                    />

                    {item.badge ? (
                      <Chip
                        label={item.badge}
                        size="small"
                        sx={{
                          height: 20,
                          minWidth: 20,
                          fontSize: 10,
                          fontWeight: 700,
                          color:
                            item.label === "Inventory" || item.label === "Orders"
                              ? "#fff"
                              : "#2f001f",
                          bgcolor:
                            item.label === "Inventory" || item.label === "Orders"
                              ? colors.badgeRed
                              : colors.badgeGold,
                          borderRadius: "999px",
                          "& .MuiChip-label": {
                            px: 0.8,
                          },
                        }}
                      />
                    ) : null}
                  </ListItemButton>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>

      <Box sx={{ px: 1.5, pb: 1.5 }}>
        <Divider sx={{ borderColor: colors.divider, mb: 1.5 }} />

        <Stack
          direction="row"
          spacing={1.2}
          alignItems="center"
          sx={{
            bgcolor: colors.sidebarCard,
            p: 1.2,
            borderRadius: 2.5,
            border: "1px solid rgba(255,255,255,0.05)",
            boxShadow: "0 8px 18px rgba(0,0,0,0.14)",
          }}
        >
          <Avatar
            sx={{
              width: 34,
              height: 34,
              bgcolor: "rgba(226,169,46,0.08)",
              color: colors.activeBorder,
              border: `1.5px solid ${colors.activeBorder}`,
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            A
          </Avatar>

          <Box sx={{ overflow: "hidden" }}>
            <Typography
              sx={{
                color: "#fff",
                fontWeight: 700,
                fontSize: 13,
                lineHeight: 1.15,
              }}
            >
              Admin
            </Typography>
            <Typography
              sx={{
                color: colors.textSecondary,
                fontSize: 10.5,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              Super Admin Access
            </Typography>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};

const AppSidebar = ({ mobileOpen, onClose }) => {
  return (
    <Box
      component="nav"
      sx={{
        width: { lg: drawerWidth },
        flexShrink: { lg: 0 },
      }}
    >
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", lg: "none" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            border: "none",
          },
        }}
      >
        <SidebarContent onItemClick={onClose} />
      </Drawer>

      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: "none", lg: "block" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            border: "none",
          },
        }}
      >
        <SidebarContent />
      </Drawer>
    </Box>
  );
};

export default AppSidebar;