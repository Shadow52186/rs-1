import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import SideBar from "../layout/SideBar";
import { Box, Typography, useMediaQuery } from "@mui/material";
import NotFound404 from "../components/pages/Notfound404";
import { login } from "../store/userSlice";

const AdminRoute = ({ children }) => {
  const user = useSelector((state) => state.user.value);
  const dispatch = useDispatch();
  const isMobile = useMediaQuery("(max-width:900px)");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      const savedRole = localStorage.getItem("role");
      const savedUsername = "Admin";
      if (savedRole) {
        dispatch(login({ username: savedUsername, role: savedRole }));
      }
    }

    const timeout = setTimeout(() => setLoading(false), 100);
    return () => clearTimeout(timeout);
  }, [user, dispatch]);

  if (loading || !user) {
    return (
      <Box minHeight="100vh" display="flex" justifyContent="center" alignItems="center">
        <Typography>⏳ Loading...</Typography>
      </Box>
    );
  }

  if (user.role !== "admin") {
    return <NotFound404 />;
  }

  return (
    <Box sx={{ display: "flex", width: "100%", minHeight: "100vh", backgroundColor: "#f9f9f9" }}>
      <SideBar />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          padding: isMobile ? "80px 16px 16px" : "24px",
          marginLeft: isMobile ? 0 : "240px", // ✅ Desktop ต้องเว้น sidebar
          overflowX: "hidden",
          width: "100%",
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default AdminRoute;
