import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Card,
  Grid,
  Stack,
  Divider,
  IconButton,
  Tooltip,
  CircularProgress,
  Button,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import RefreshIcon from "@mui/icons-material/Refresh";
import Swal from "sweetalert2";
import Particles from "../../../components/effects/Particles";
import Threads from "../../../components/effects/Threads";
import { motion } from "framer-motion";

// Create axios instance with optimized settings
const api = axios.create({
  timeout: 10000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
});

// Cache for API responses
const cache = new Map();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes for purchase history

// Optimized fetch with caching
const fetchWithCache = async (url, config) => {
  const cacheKey = `${url}-${JSON.stringify(config)}`;
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const response = await api.get(url, config);
    cache.set(cacheKey, {
      data: response.data,
      timestamp: Date.now()
    });
    return response.data;
  } catch (error) {
    if (cached) return cached.data;
    throw error;
  }
};

// Memoized Background Component
const BackgroundEffects = React.memo(() => (
  <Box
    sx={{
      position: "fixed",
      width: "100vw",
      height: "100vh",
      top: 0,
      left: 0,
      zIndex: 0,
      pointerEvents: "none",
    }}
  >
    <Particles
      particleCount={100} // Reduced for better performance
      particleColors={["#ffffff", "#bbf7ff", "#c084fc"]}
      particleBaseSize={60}
      moveParticlesOnHover
      particleHoverFactor={1.3}
      alphaParticles
    />
    <Threads
      color={[0.6, 0.3, 1]}
      amplitude={0.6}
      distance={0.0}
      enableMouseInteraction
    />
  </Box>
));

// Memoized Search Input Component
const SearchInput = React.memo(({ searchTerm, onSearchChange }) => (
  <Box
    sx={{
      maxWidth: "500px",
      mx: "auto",
      mb: 5,
    }}
  >
    <input
      type="text"
      placeholder="🔍 ค้นหาชื่อสินค้า..."
      value={searchTerm}
      onChange={onSearchChange}
      style={{
        width: "100%",
        padding: "14px 20px",
        fontSize: "16px",
        borderRadius: "12px",
        border: "none",
        outline: "none",
        background: "rgba(255, 255, 255, 0.08)",
        color: "#fff",
        boxShadow: "0 0 12px rgba(168, 85, 247, 0.2)",
      }}
    />
  </Box>
));

// Memoized Purchase Card Component
const PurchaseCard = React.memo(({ item, index, onCopy }) => {
  const handleCopyChoice = useCallback(() => {
    onCopy(item.username, item.password);
  }, [item.username, item.password, onCopy]);

  const formattedDate = useMemo(() => {
    return new Date(item.createdAt).toLocaleString("th-TH", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }, [item.createdAt]);

  return (
    <Grid item xs={12} sm={10} md={6} sx={{ display: "flex" }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: Math.min(index * 0.08, 1) }}
        viewport={{ once: true, margin: "-50px" }}
        style={{ width: "100%" }}
      >
        <Card
          sx={{
            p: 3,
            borderRadius: "20px",
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 0 30px rgba(147,51,234,0.2)",
            position: "relative",
            height: "100%",
            transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: "0 0 40px rgba(147,51,234,0.3)",
            },
          }}
        >
          <Tooltip title="เลือกสิ่งที่จะคัดลอก">
            <IconButton
              onClick={handleCopyChoice}
              sx={{
                position: "absolute",
                top: 16,
                right: 16,
                color: "#c084fc",
                background: "rgba(192, 132, 252, 0.1)",
                "&:hover": {
                  background: "rgba(192, 132, 252, 0.2)",
                  transform: "scale(1.1)",
                },
              }}
            >
              <ContentCopyIcon />
            </IconButton>
          </Tooltip>

          <Stack spacing={2} mt={1}>
            <Typography
              fontWeight="bold"
              fontSize="18px"
              sx={{ 
                color: "#fff",
                pr: 5, // Add padding to prevent overlap with copy button
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              📦 {item.product?.name || "ไม่ระบุชื่อสินค้า"}
            </Typography>

            <Box
              sx={{
                background: "rgba(255, 255, 255, 0.05)",
                borderRadius: "12px",
                p: 2,
              }}
            >
              <Typography 
                fontSize="16px" 
                sx={{ 
                  color: "#93c5fd", 
                  mb: 1,
                  wordBreak: "break-all",
                }}
              >
                🧑‍💻 Username: <Box component="span" sx={{ fontWeight: "bold" }}>{item.username}</Box>
              </Typography>
              <Typography 
                fontSize="16px" 
                sx={{ 
                  color: "#93c5fd",
                  wordBreak: "break-all",
                }}
              >
                🔐 Password: <Box component="span" sx={{ fontWeight: "bold" }}>{item.password}</Box>
              </Typography>
            </Box>

            <Divider sx={{ borderColor: "rgba(255,255,255,0.2)" }} />
            
            <Typography fontSize="14px" sx={{ color: "#bbb" }}>
              🕒 วันที่ซื้อ: {formattedDate}
            </Typography>
            
            {item.product?.price && (
              <Typography fontSize="14px" sx={{ color: "#4ade80" }}>
                💰 ราคา: {item.product.price} POINT
              </Typography>
            )}
          </Stack>
        </Card>
      </motion.div>
    </Grid>
  );
});

// Loading Component
const LoadingComponent = React.memo(() => (
  <Box sx={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>
    <BackgroundEffects />
    <Box
      sx={{
        maxWidth: "1200px",
        mx: "auto",
        p: 4,
        position: "relative",
        zIndex: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "50vh",
      }}
    >
      <CircularProgress size={60} sx={{ color: "#a855f7", mb: 3 }} />
      <Typography
        variant="h5"
        fontWeight="bold"
        align="center"
        sx={{
          color: "#fff",
          textShadow: "0 0 10px #a855f7",
        }}
      >
        กำลังโหลดประวัติการซื้อ...
      </Typography>
    </Box>
  </Box>
));

// Error Component
const ErrorComponent = React.memo(({ error, onRetry }) => (
  <Box sx={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>
    <BackgroundEffects />
    <Box
      sx={{
        maxWidth: "1200px",
        mx: "auto",
        p: 4,
        position: "relative",
        zIndex: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "50vh",
      }}
    >
      <Typography
        variant="h5"
        fontWeight="bold"
        align="center"
        sx={{
          color: "#ff6b6b",
          textShadow: "0 0 10px #ff6b6b",
          mb: 2,
        }}
      >
        เกิดข้อผิดพลาด
      </Typography>
      <Typography sx={{ color: "#fff", mb: 3, textAlign: "center" }}>
        {error}
      </Typography>
      <Button
        onClick={onRetry}
        startIcon={<RefreshIcon />}
        sx={{
          background: "linear-gradient(90deg, #6366f1, #a855f7)",
          color: "#fff",
          fontWeight: "bold",
          borderRadius: "999px",
          px: 3,
          py: 1,
          "&:hover": {
            background: "linear-gradient(90deg, #7c3aed, #4f46e5)",
          },
        }}
      >
        ลองใหม่
      </Button>
    </Box>
  </Box>
));

// Empty State Component
const EmptyStateComponent = React.memo(() => (
  <Box sx={{ textAlign: "center", py: 8 }}>
    <Typography
      variant="h5"
      fontWeight="bold"
      sx={{ color: "#fff", mb: 2 }}
    >
      📭 ยังไม่มีประวัติการซื้อ
    </Typography>
    <Typography sx={{ color: "#bbb" }}>
      เมื่อคุณซื้อสินค้าแล้ว ประวัติจะแสดงที่นี่
    </Typography>
  </Box>
));

const PurchaseHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  const fetchHistory = useCallback(async () => {
    if (!token) {
      setError("ไม่พบ Token กรุณาเข้าสู่ระบบใหม่");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      const data = await fetchWithCache(
        `${process.env.REACT_APP_API}/purchase/history`,
        config
      );
      setHistory(data || []);
    } catch (err) {
      console.error("❌ ไม่สามารถโหลดประวัติได้", err);
      setError(
        err.response?.status === 401 
          ? "กรุณาเข้าสู่ระบบใหม่" 
          : "ไม่สามารถโหลดประวัติได้ กรุณาลองใหม่"
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleCopyChoice = useCallback((username, password) => {
    Swal.fire({
      title: "เลือกสิ่งที่คุณต้องการคัดลอก",
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: "🧑‍💻 Username",
      denyButtonText: "🔐 Password",
      cancelButtonText: "ยกเลิก",
      background: "rgba(30,30,40,0.95)",
      color: "#fff",
      confirmButtonColor: "#6366f1",
      denyButtonColor: "#a855f7",
    }).then((result) => {
      if (result.isConfirmed) {
        navigator.clipboard.writeText(username);
        Swal.fire({
          title: "คัดลอกแล้ว",
          text: "Username ถูกคัดลอกแล้ว",
          icon: "success",
          background: "rgba(30,30,40,0.95)",
          color: "#fff",
          confirmButtonColor: "#10b981",
        });
      } else if (result.isDenied) {
        navigator.clipboard.writeText(password);
        Swal.fire({
          title: "คัดลอกแล้ว",
          text: "Password ถูกคัดลอกแล้ว",
          icon: "success",
          background: "rgba(30,30,40,0.95)",
          color: "#fff",
          confirmButtonColor: "#10b981",
        });
      }
    });
  }, []);

  const handleRetry = useCallback(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Memoized filtered history
  const filteredHistory = useMemo(() => {
    if (!searchTerm) return history;
    return history.filter((item) =>
      item.product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [history, searchTerm]);

  // Early returns for loading and error states
  if (loading) {
    return <LoadingComponent />;
  }

  if (error) {
    return <ErrorComponent error={error} onRetry={handleRetry} />;
  }

  return (
    <Box sx={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>
      <BackgroundEffects />

      <Box
        sx={{
          maxWidth: "1200px",
          mx: "auto",
          p: 4,
          position: "relative",
          zIndex: 2,
        }}
      >
        <Typography
          variant="h4"
          fontWeight="bold"
          align="center"
          sx={{
            color: "#fff",
            mb: 4,
            textShadow: "0 0 10px #a855f7, 0 0 20px #9333ea",
          }}
        >
          📜 ประวัติการซื้อสินค้า
        </Typography>

        {/* Search Field */}
        <SearchInput
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
        />

        {/* Refresh Button */}
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Button
            onClick={handleRetry}
            startIcon={<RefreshIcon />}
            sx={{
              background: "rgba(255, 255, 255, 0.1)",
              color: "#fff",
              borderRadius: "999px",
              px: 3,
              py: 1,
              "&:hover": {
                background: "rgba(255, 255, 255, 0.2)",
              },
            }}
          >
            รีเฟรช
          </Button>
        </Box>

        {/* Purchase History Cards */}
        {history.length === 0 ? (
          <EmptyStateComponent />
        ) : filteredHistory.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography
              variant="h6"
              sx={{ color: "#fff", mb: 2 }}
            >
              🔍 ไม่พบผลการค้นหา
            </Typography>
            <Typography sx={{ color: "#bbb" }}>
              ลองค้นหาด้วยชื่อสินค้าอื่น
            </Typography>
          </Box>
        ) : (
          <>
            <Typography
              sx={{
                color: "#bbb",
                textAlign: "center",
                mb: 4,
                fontSize: "14px",
              }}
            >
              พบประวัติ {filteredHistory.length} รายการ
            </Typography>
            
            <Grid container spacing={4} justifyContent="center">
              {filteredHistory.map((item, index) => (
                <PurchaseCard
                  key={`${item._id || index}-${item.createdAt}`}
                  item={item}
                  index={index}
                  onCopy={handleCopyChoice}
                />
              ))}
            </Grid>
          </>
        )}
      </Box>
    </Box>
  );
};

export default PurchaseHistoryPage;