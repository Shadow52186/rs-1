import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Box,
  Container,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import HomeIcon from "@mui/icons-material/Home";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PaymentIcon from "@mui/icons-material/Payment";
import HelpIcon from "@mui/icons-material/Help";
import HistoryIcon from "@mui/icons-material/History";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/userSlice";

const pages = [
  { title: "หน้าแรก", to: "/user/index", icon: <HomeIcon /> },
  { title: "สินค้า", to: "/products", icon: <ShoppingCartIcon /> },
  { title: "เติมเงิน", to: "/topup", icon: <PaymentIcon /> },
  { title: "ประวัติการเติมเงิน", to: "/topup/history", icon: <HelpIcon /> },
  { title: "ประวัติซื้อสินค้า", to: "/user/history", icon: <HistoryIcon /> },
];

function ResponsiveAppBar() {
  const user = useSelector((state) => state.user.value);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAdmin = user?.role === "admin";

  const handleUserMenuOpen = (e) => setAnchorElUser(e.currentTarget);
  const handleUserMenuClose = () => setAnchorElUser(null);
  const handleLogout = () => {
    dispatch(logout());
    handleUserMenuClose();
    navigate("/login");
  };
  const handleGoTo = (path) => {
    handleUserMenuClose();
    navigate(path);
  };
  const toggleDrawer = (open) => () => {
    setMobileOpen(open);
  };

  const drawer = (
    <Box
      sx={{
        width: 250,
        background: "#1f1f2d",
        color: "#fff",
        height: "100%",
        py: 2,
      }}
      role="presentation"
      onClick={toggleDrawer(false)}
    >
      <List>
        {pages.map((item, index) => (
          <ListItem button key={index} component={Link} to={item.to}>
            <ListItemIcon sx={{ color: "#a855f7" }}>{item.icon}</ListItemIcon>
            <ListItemText
              primary={item.title}
              sx={{ fontFamily: "Prompt, sans-serif", fontWeight: "bold" }}
            />
          </ListItem>
        ))}
        {isAdmin && (
          <ListItem button component={Link} to="/admin/viewtable">
            <ListItemIcon sx={{ color: "#a855f7" }}>
              <AccountCircleIcon />
            </ListItemIcon>
            <ListItemText primary="จัดการหลังบ้าน" />
          </ListItem>
        )}
        {!user ? (
          <ListItem button component={Link} to="/login">
            <ListItemIcon sx={{ color: "#a855f7" }}>
              <AccountCircleIcon />
            </ListItemIcon>
            <ListItemText primary="เข้าสู่ระบบ" />
          </ListItem>
        ) : (
          <>
            <ListItem button onClick={() => handleGoTo("/user/profile")}>
              <ListItemIcon sx={{ color: "#a855f7" }}>
                <AccountCircleIcon />
              </ListItemIcon>
              <ListItemText primary="โปรไฟล์" />
            </ListItem>
            <ListItem button onClick={handleLogout}>
              <ListItemText primary="ออกจากระบบ" />
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          background: "rgba(20, 20, 40, 0.6)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 0 40px rgba(168, 85, 247, 0.25)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
            {/* Logo */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
              <Box
                component="img"
                src={`${process.env.PUBLIC_URL}/assets/logo 3.png`}
                alt="Logo"
                sx={{ height: 100, filter: "drop-shadow(0 0 8px #c084fc)" }}
              />
              <Typography
                variant="h6"
                sx={{
                  fontFamily: "Orbitron, sans-serif",
                  fontWeight: 700,
                  fontSize: "20px",
                  letterSpacing: "2px",
                  color: "#fff",
                  textShadow: "0 0 8px #9333ea, 0 0 16px #a855f7",
                }}
              >
                RS-SHOP
              </Typography>
            </Box>

            {/* Full nav for >= 1300px */}
            <Box sx={{ display: { xs: "none", xl: "flex" }, gap: 3 }}>
              {pages.map((item, i) => (
                <Button
                  key={i}
                  component={Link}
                  to={item.to}
                  startIcon={item.icon}
                  sx={{
                    color: "#f3f4f6",
                    fontWeight: 600,
                    fontSize: "16px",
                    px: 2,
                    py: 1,
                    fontFamily: "Orbitron, sans-serif",
                    textTransform: "uppercase",
                    borderRadius: "12px",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      color: "#c084fc",
                      transform: "scale(1.07)",
                      background: "rgba(255,255,255,0.05)",
                    },
                  }}
                >
                  {item.title}
                </Button>
              ))}
            </Box>

            {/* Right Side */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton sx={{ color: "#fff" }}>
                <SearchIcon />
              </IconButton>
              <IconButton
                onClick={toggleDrawer(true)}
                sx={{ display: { xs: "flex", xl: "none" }, color: "white" }}
              >
                <MenuIcon />
              </IconButton>

              {/* ✅ Profile Button with Menu */}
              {user ? (
                <>
                  <Button
                    onClick={handleUserMenuOpen}
                    startIcon={<AccountCircleIcon />}
                    sx={{
                      color: "#fff",
                      border: "1px solid rgba(255,255,255,0.2)",
                      px: 2,
                      py: 1,
                      fontSize: "14px",
                      borderRadius: "10px",
                      textTransform: "uppercase",
                      fontFamily: "Orbitron, sans-serif",
                      display: { xs: "none", xl: "flex" },
                      "&:hover": {
                        background: "rgba(168, 85, 247, 0.2)",
                        color: "#c084fc",
                      },
                    }}
                  >
                    {user.username}
                  </Button>
                  <Menu
                    anchorEl={anchorElUser}
                    open={Boolean(anchorElUser)}
                    onClose={handleUserMenuClose}
                  >
                    <MenuItem onClick={() => handleGoTo("/user/profile")}>
                      โปรไฟล์
                    </MenuItem>
                    <MenuItem onClick={() => handleGoTo("/user/history")}>
                      ประวัติการซื้อ
                    </MenuItem>
                    {isAdmin && (
                      <MenuItem onClick={() => handleGoTo("/admin/viewtable")}>
                        หลังบ้าน
                      </MenuItem>
                    )}
                    <MenuItem onClick={handleLogout}>ออกจากระบบ</MenuItem>
                  </Menu>
                </>
              ) : (
                <Button
                  component={Link}
                  to="/login"
                  sx={{
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.2)",
                    px: 2,
                    py: 1,
                    fontSize: "14px",
                    borderRadius: "10px",
                    textTransform: "uppercase",
                    fontFamily: "Orbitron, sans-serif",
                    display: { xs: "none", xl: "flex" },
                    "&:hover": {
                      background: "rgba(168, 85, 247, 0.2)",
                      color: "#c084fc",
                    },
                  }}
                >
                  เข้าสู่ระบบ
                </Button>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={toggleDrawer(false)}
        PaperProps={{
          sx: {
            backgroundColor: "#1f1f2d",
            color: "#fff",
            boxShadow: "0 0 20px rgba(168,85,247,0.2)",
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}

export default ResponsiveAppBar;
