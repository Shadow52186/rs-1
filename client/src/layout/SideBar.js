import React, { useState } from "react";
import { Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  useMediaQuery,
  Drawer,
} from "@mui/material";
import { Link } from "react-router-dom";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import TableViewIcon from "@mui/icons-material/TableView";

const SideBar = () => {
  const isMobile = useMediaQuery("(max-width:900px)");
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = (
    <Menu
  iconShape="square"
  menuItemStyles={{
    button: {
      color: "#000",
      "&:hover": {
        backgroundColor: "#f0f0f0",
        color: "#000",
      },
    },
    label: {
      color: "#000",
    },
  }}
>
  <MenuItem
    icon={<HomeOutlinedIcon />}
    component={<Link to="/user/index" />}
  >
    หน้าบ้าน
  </MenuItem>

  <SubMenu label="Data" icon={<MapOutlinedIcon />}>
    <MenuItem
      icon={<TableViewIcon />}
      component={<Link to="/admin/viewtable" />}
    >
      Table
    </MenuItem>
    <MenuItem
      icon={<BarChartOutlinedIcon />}
      component={<Link to="/admin/stats/sales" />}
    >
      สถิติยอดขาย
    </MenuItem>
  </SubMenu>

  <SubMenu label="Manage" icon={<PeopleOutlinedIcon />}>
    <MenuItem component={<Link to="/admin/manage" />}>User</MenuItem>
    <MenuItem component={<Link to="/admin/manage-category" />}>
      Category
    </MenuItem>
  </SubMenu>

  <MenuItem icon={<CalendarTodayOutlinedIcon />}>Calendar</MenuItem>
  <MenuItem icon={<ReceiptOutlinedIcon />}>Documentation</MenuItem>
</Menu>

  );

  return (
    <>
      {isMobile ? (
        <>
          <AppBar
            position="fixed"
            sx={{ backgroundColor: "#fff", color: "#000" }}
          >
            <Toolbar>
              <IconButton
                edge="start"
                color="inherit"
                onClick={() => setMobileOpen(true)}
              >
                <MenuOutlinedIcon />
              </IconButton>
            </Toolbar>
          </AppBar>

          <Drawer
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            PaperProps={{ sx: { width: 240 } }}
          >
            <Box p={2}>{menuItems}</Box>
          </Drawer>
        </>
      ) : (
        <Box
          sx={{
            width: 240,
            height: "100vh",
            position: "fixed",
            left: 0,
            top: 0,
            backgroundColor: "#fff",
            boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
            zIndex: 1200,
          }}
        >
          {menuItems}
        </Box>
      )}
    </>
  );
};

export default SideBar;
