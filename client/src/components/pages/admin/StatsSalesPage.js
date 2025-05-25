import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  useTheme,
} from "@mui/material";

import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import ShoppingBagRoundedIcon from "@mui/icons-material/ShoppingBagRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";

import axios from "axios";

const StatCard = ({ icon, label, value, description, color }) => {
  const theme = useTheme();
  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        borderRadius: 3,
        height: "100%",
        backgroundColor: "#fff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <Box display="flex" alignItems="center" gap={2}>
        <Box
          sx={{
            backgroundColor: color,
            width: 56,
            height: 56,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="h4" fontWeight="bold">
            {value}
          </Typography>
        </Box>
      </Box>
      <Typography variant="body2" mt={2} color="#0000">
        {description}
      </Typography>
    </Paper>
  );
};

const StatsSalesPage = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API}/stats`);
        setStats(res.data);
      } catch (err) {
        console.error("โหลดข้อมูลสถิติล้มเหลว:", err);
      }
    };
    fetchStats();
  }, []);

  return (
    <Box
      sx={{
        backgroundColor: "#e6f5ec00",
        minHeight: "100vh",
        py: 6,
        px: { xs: 2, md: 6 },
      }}
    >
      <Typography variant="h4" fontWeight="bold" mb={4} sx={{ color: "#000" }} >
        📊 รายงานภาพรวมระบบ 
      </Typography>

      {!stats ? (
        <Box textAlign="center" mt={10}>
          <CircularProgress size={60} />
        </Box>
      ) : (
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={<PeopleAltRoundedIcon fontSize="large" />}
              label="จำนวนผู้ใช้"
              value={stats.users}
              description="จำนวนผู้ใช้ที่ลงทะเบียนในระบบ"
              color="#1976d2"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={<Inventory2RoundedIcon fontSize="large" />}
              label="สินค้าทั้งหมด"
              value={stats.products}
              description="สินค้าทั้งหมดที่เปิดขายในระบบ"
              color="#9c27b0"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={<ShoppingBagRoundedIcon fontSize="large" />}
              label="ยอดขายรวม"
              value={stats.sold}
              description="จำนวนสินค้าที่ถูกขายทั้งหมด"
              color="#2e7d32"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={<CategoryRoundedIcon fontSize="large" />}
              label="หมวดหมู่"
              value={stats.categories}
              description="จำนวนหมวดหมู่สินค้าที่มีในระบบ"
              color="#ff9800"
            />
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default StatsSalesPage;
