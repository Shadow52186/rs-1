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
  Pagination,
  CircularProgress,
  Alert,
} from "@mui/material";

const AdminSalesHistoryPage = () => {
  const [sales, setSales] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const token = localStorage.getItem("token");

  const isMobile = useMediaQuery("(max-width:600px)");

  const [totalRevenue, setTotalRevenue] = useState(0);
  const [categoryTotals, setCategoryTotals] = useState({});

  useEffect(() => {
    const fetchSales = async () => {
      setLoading(true);
      setError("");
      try {
        // เพิ่ม timestamp เพื่อบังคับไม่ใช้ cache
        const timestamp = Date.now();
        const res = await axios.get(
          `${process.env.REACT_APP_API}/admin/sales-log?page=${page}&limit=50&search=${search}&_t=${timestamp}`,
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            },
          }
        );
        
        const data = res.data;
        
        // ตรวจสอบ structure ของข้อมูล
        if (data && data.sales && Array.isArray(data.sales)) {
          // Backend ส่ง object มี sales property
          setSales(data.sales);
          setTotal(data.total || 0);
          setPage(data.page || 1);
          setTotalPages(data.totalPages || 1);
          
          // คำนวณยอดขายรวม
          const totalRev = data.sales.reduce((sum, item) => {
            const price = parseFloat(item.price) || parseFloat(item.purchasePrice) || 0;
            return sum + price;
          }, 0);
          setTotalRevenue(totalRev);

          // คำนวณรายได้ตามหมวดหมู่
          const categoryMap = {};
          data.sales.forEach((item) => {
            const category = item.category || item.categoryName || "ไม่ทราบหมวด";
            const price = parseFloat(item.price) || parseFloat(item.purchasePrice) || 0;
            categoryMap[category] = (categoryMap[category] || 0) + price;
          });
          setCategoryTotals(categoryMap);
          
        } else if (Array.isArray(data)) {
          // Backend ส่ง array โดยตรง
          setSales(data);
          setTotal(data.length);
          setPage(1);
          setTotalPages(1);
          
          // คำนวณยอดขายรวม
          const totalRev = data.reduce((sum, item) => {
            const price = parseFloat(item.price) || parseFloat(item.purchasePrice) || 0;
            return sum + price;
          }, 0);
          setTotalRevenue(totalRev);

          // คำนวณรายได้ตามหมวดหมู่
          const categoryMap = {};
          data.forEach((item) => {
            const category = item.category || item.categoryName || "ไม่ทราบหมวด";
            const price = parseFloat(item.price) || parseFloat(item.purchasePrice) || 0;
            categoryMap[category] = (categoryMap[category] || 0) + price;
          });
          setCategoryTotals(categoryMap);
        } else {
          throw new Error("Invalid data format from backend");
        }
        
      } catch (err) {
        console.error("Error fetching sales:", err);
        setError("ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
        setSales([]);
        setTotal(0);
        setTotalRevenue(0);
        setCategoryTotals({});
      } finally {
        setLoading(false);
      }
    };

    // Debounce search
    const timeoutId = setTimeout(() => {
      fetchSales();
    }, search ? 500 : 0);

    return () => clearTimeout(timeoutId);
  }, [token, page, search]);

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

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
        onChange={handleSearchChange}
        disabled={loading}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 3, background: "#f3f3f3" }}>
        <Typography variant="h6">
          💰 ยอดขายในหน้านี้: {totalRevenue.toLocaleString()} ฿
        </Typography>
        <Typography variant="body2" color="text.secondary">
          📝 รายการทั้งหมด: {total.toLocaleString()} รายการ
        </Typography>
        <Divider sx={{ my: 1 }} />
        {Object.entries(categoryTotals).map(([cat, value]) => (
          <Typography key={cat} variant="body2">
            📁 {cat}: {value.toLocaleString()} ฿
          </Typography>
        ))}
      </Paper>

      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
          <Typography ml={2}>กำลังโหลดข้อมูล...</Typography>
        </Box>
      ) : (
        <>
          {isMobile ? (
            <Stack spacing={2}>
              {sales.length === 0 && (
                <Typography align="center" color="gray">
                  ไม่พบข้อมูล
                </Typography>
              )}
              {sales.map((item, index) => (
                <Paper
                  key={index}
                  sx={{
                    p: 2,
                    borderRadius: "12px",
                    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
                  }}
                >
                  <Typography fontWeight="bold" sx={{ wordBreak: "break-word" }}>
                    📦 สินค้า: {item.productName || "ไม่ระบุ"}
                  </Typography>
                  <Typography sx={{ wordBreak: "break-word" }}>
                    📁 หมวดหมู่: {item.category || item.categoryName || "ไม่ทราบหมวด"}
                  </Typography>
                  <Typography sx={{ wordBreak: "break-word" }}>
                    👤 ผู้ซื้อ: {item.buyerUsername || "ไม่ระบุ"}
                  </Typography>
                  <Typography sx={{ wordBreak: "break-word" }}>
                    🧑‍💻 Username: {item.username || "ไม่ระบุ"}
                  </Typography>
                  <Typography sx={{ wordBreak: "break-word" }}>
                    🔐 Password: {item.password || "ไม่ระบุ"}
                  </Typography>
                  <Typography fontWeight="bold" color="primary">
                    💸 ราคา: {(parseFloat(item.price) || parseFloat(item.purchasePrice) || 0).toLocaleString()} ฿
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography color="gray">
                    🕒 ขายเมื่อ:{" "}
                    {item.soldAt ? 
                      new Date(item.soldAt).toLocaleString("th-TH", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })
                      : "ไม่ทราบวันที่"
                    }
                  </Typography>
                </Paper>
              ))}
            </Stack>
          ) : (
            <Stack spacing={2}>
              {sales.length === 0 && (
                <Typography align="center" color="gray">
                  ไม่พบข้อมูล
                </Typography>
              )}
              {sales.map((item, index) => (
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
                    📦 {item.productName || "ไม่ระบุ"}
                  </Typography>

                  <Box display="flex" flexWrap="wrap" gap={1} mt={0.5}>
                    <Typography fontSize="14px" color="text.secondary">
                      📁 {item.category || item.categoryName || "ไม่ทราบหมวด"}
                    </Typography>
                    <Typography fontSize="14px" color="text.secondary">
                      👤 {item.buyerUsername || "ไม่ระบุ"}
                    </Typography>
                    <Typography fontSize="14px" color="primary" fontWeight="bold">
                      💸 {(parseFloat(item.price) || parseFloat(item.purchasePrice) || 0).toLocaleString()} ฿
                    </Typography>
                  </Box>

                  <Box display="flex" flexWrap="wrap" gap={1} mt={0.5}>
                    <Typography fontSize="13px" color="text.secondary">
                      🧑‍💻 {item.username || "ไม่ระบุ"}
                    </Typography>
                    <Typography fontSize="13px" color="text.secondary">
                      🔐 {item.password || "ไม่ระบุ"}
                    </Typography>
                  </Box>

                  <Typography
                    variant="body2"
                    color="gray"
                    mt={1}
                    sx={{ fontSize: "13px" }}
                  >
                    🕒{" "}
                    {item.soldAt ? 
                      new Date(item.soldAt).toLocaleString("th-TH", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })
                      : "ไม่ทราบวันที่"
                    }
                  </Typography>
                </Paper>
              ))}
            </Stack>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={3}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size={isMobile ? "small" : "medium"}
                showFirstButton
                showLastButton
                disabled={loading}
              />
            </Box>
          )}

          {/* Page Info */}
          {sales.length > 0 && (
            <Typography variant="body2" color="text.secondary" textAlign="center" mt={2}>
              หน้า {page} จาก {totalPages} (แสดง {sales.length} จาก {total.toLocaleString()} รายการ)
            </Typography>
          )}
        </>
      )}
    </Box>
  );
};

export default AdminSalesHistoryPage;