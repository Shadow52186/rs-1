import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Paper,
  TextField,
  useMediaQuery,
  Stack,
  Divider,
} from "@mui/material";

const AdminSalesHistoryPage = () => {
  const [sales, setSales] = useState([]);
  const [search, setSearch] = useState("");
  const token = localStorage.getItem("token");

  const isMobile = useMediaQuery("(max-width:600px)");

  const [totalRevenue, setTotalRevenue] = useState(0);
  const [categoryTotals, setCategoryTotals] = useState({});

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API}/admin/sales-log`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = res.data;
        setSales(data);

        const total = data.reduce((sum, item) => sum + Number(item.price), 0);
        setTotalRevenue(total);

        const categoryMap = {};
        data.forEach((item) => {
          const category = item.category || "ไม่ทราบหมวด";
          categoryMap[category] =
            (categoryMap[category] || 0) + Number(item.price);
        });
        setCategoryTotals(categoryMap);
      } catch (err) {
        console.error("โหลดประวัติการขายล้มเหลว", err);
      }
    };

    fetchSales();
  }, [token]);

  const filteredSales = sales.filter(
    (item) =>
      (item.productName || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.category || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.buyerUsername || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ padding: isMobile ? 2 : 4 }}>
      <Typography
        variant={isMobile ? "h5" : "h4"}
        fontWeight="bold"
        gutterBottom
        sx={{ color: "#000", textAlign: isMobile ? "center" : "left" }}
      >
        📊 ประวัติการขายทั้งหมด
      </Typography>

      <TextField
        label="ค้นหา (ชื่อสินค้า, หมวดหมู่, ผู้ซื้อ)"
        variant="outlined"
        fullWidth
        size="small"
        sx={{ mb: 3 }}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <Paper sx={{ p: 2, mb: 3, background: "#f3f3f3" }}>
        <Typography variant="h6">
          💰 ยอดขายรวมทั้งหมด: {totalRevenue} ฿
        </Typography>
        <Divider sx={{ my: 1 }} />
        {Object.entries(categoryTotals).map(([cat, value]) => (
          <Typography key={cat}>
            📁 {cat}: {value} ฿
          </Typography>
        ))}
      </Paper>

      {isMobile ? (
        <Stack spacing={2}>
          {filteredSales.length === 0 && (
            <Typography align="center" color="gray">
              ไม่พบข้อมูล
            </Typography>
          )}
          {filteredSales.map((item, index) => (
            <Paper
              key={index}
              sx={{
                p: 2,
                borderRadius: "12px",
                boxShadow: "0 0 10px rgba(0,0,0,0.1)",
              }}
            >
              <Typography fontWeight="bold" sx={{ wordBreak: "break-word" }}>
                📦 สินค้า: {item.productName}
              </Typography>
              <Typography sx={{ wordBreak: "break-word" }}>
                📁 หมวดหมู่: {item.category}
              </Typography>
              <Typography sx={{ wordBreak: "break-word" }}>
                👤 ผู้ซื้อ: {item.buyerUsername}
              </Typography>
              <Typography sx={{ wordBreak: "break-word" }}>
                🧑‍💻 Username: {item.username}
              </Typography>
              <Typography sx={{ wordBreak: "break-word" }}>
                🔐 Password: {item.password}
              </Typography>
              <Typography>💸 ราคา: {item.price} ฿</Typography>
              <Divider sx={{ my: 1 }} />
              <Typography color="gray">
                🕒 ขายเมื่อ:{" "}
                {new Date(item.soldAt).toLocaleString("th-TH", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </Typography>
            </Paper>
          ))}
        </Stack>
      ) : (
        <Stack spacing={2}>
          {filteredSales.length === 0 && (
            <Typography align="center" color="gray">
              ไม่พบข้อมูล
            </Typography>
          )}
          {filteredSales.map((item, index) => (
            <Paper
              key={index}
              sx={{
                p: 2,
                borderRadius: "12px",
                boxShadow: "0 0 6px rgba(0,0,0,0.08)",
                background: "#fff",
                overflow: "hidden",
              }}
            >
              <Typography
                fontWeight="bold"
                fontSize="16px"
                sx={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                📦 {item.productName}
              </Typography>

              <Box display="flex" flexWrap="wrap" gap={1} mt={0.5}>
                <Typography fontSize="14px" color="text.secondary">
                  📁 {item.category}
                </Typography>
                <Typography fontSize="14px" color="text.secondary">
                  👤 {item.buyerUsername}
                </Typography>
                <Typography fontSize="14px" color="text.secondary">
                  💸 {item.price} ฿
                </Typography>
              </Box>

              <Typography
                variant="body2"
                color="gray"
                mt={1}
                sx={{ fontSize: "13px" }}
              >
                🕒{" "}
                {new Date(item.soldAt).toLocaleString("th-TH", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </Typography>
            </Paper>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default AdminSalesHistoryPage;
