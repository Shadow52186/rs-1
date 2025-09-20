import React, { useEffect, useState, useCallback, useMemo } from "react";
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  Stack, 
  Divider, 
  CircularProgress, 
  Button,
  Chip
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import axios from "axios";
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
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

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
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      zIndex: 0,
      pointerEvents: "none",
    }}
  >
    <Box sx={{ position: "absolute", inset: 0, zIndex: 0 }}>
      <Particles
        particleCount={100} // Reduced for better performance
        particleColors={["#ffffff", "#bbf7ff", "#c084fc"]}
        particleBaseSize={60}
        moveParticlesOnHover
        particleHoverFactor={1.3}
        alphaParticles
      />
    </Box>
    <Box sx={{ position: "absolute", inset: 0, zIndex: 1 }}>
      <Threads
        color={[0.6, 0.3, 1]}
        amplitude={0.6}
        distance={0}
        enableMouseInteraction
      />
    </Box>
  </Box>
));

// Memoized Topup Card Component
const TopupCard = React.memo(({ item, index }) => {
  const formattedCreatedAt = useMemo(() => {
    return new Date(item.createdAt).toLocaleString("th-TH", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }, [item.createdAt]);

  const formattedSlipTime = useMemo(() => {
    if (!item.slip_time) return null;
    return new Date(item.slip_time).toLocaleString("th-TH", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }, [item.slip_time]);

  const paymentMethod = useMemo(() => {
    if (!item.method) return null;
    return item.method === "bank" ? "โอนผ่านธนาคาร" : "TrueMoney";
  }, [item.method]);

  const statusColor = useMemo(() => {
    if (item.status === "approved") return "#4ade80";
    if (item.status === "pending") return "#f59e0b";
    if (item.status === "rejected") return "#ef4444";
    return "#6b7280";
  }, [item.status]);

  const statusText = useMemo(() => {
    if (item.status === "approved") return "อนุมัติแล้ว";
    if (item.status === "pending") return "รออนุมัติ";
    if (item.status === "rejected") return "ปฏิเสธ";
    return "ไม่ระบุสถานะ";
  }, [item.status]);

  return (
    <Grid item xs={12} sm={8} md={6}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: Math.min(index * 0.08, 1) }}
        viewport={{ once: true, margin: "-50px" }}
      >
        <Card
          sx={{
            p: 3,
            borderRadius: "20px",
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 0 30px rgba(147,51,234,0.2)",
            height: "100%",
            transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: "0 0 40px rgba(147,51,234,0.3)",
            },
          }}
        >
          <Stack spacing={2}>
            {/* Amount and Status */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography
                fontWeight="bold"
                fontSize="20px"
                sx={{ color: "#fff" }}
              >
                💰 {item.amount} บาท
              </Typography>
              
              {item.status && (
                <Chip
                  label={statusText}
                  size="small"
                  sx={{
                    backgroundColor: statusColor,
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: "12px",
                  }}
                />
              )}
            </Box>

            {/* Payment Method */}
            {paymentMethod && (
              <Box
                sx={{
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "12px",
                  p: 2,
                }}
              >
                <Typography fontSize="15px" sx={{ color: "#ddd" }}>
                  📲 ช่องทาง: <Box component="span" sx={{ fontWeight: "bold" }}>{paymentMethod}</Box>
                </Typography>
              </Box>
            )}

            {/* Transaction Details */}
            {item.transaction_id && (
              <Typography fontSize="14px" sx={{ color: "#ccc", wordBreak: "break-all" }}>
                🔐 เลขอ้างอิง: {item.transaction_id}
              </Typography>
            )}

            {formattedSlipTime && (
              <Typography fontSize="14px" sx={{ color: "#ccc" }}>
                ⏱️ เวลาตามสลิป: {formattedSlipTime}
              </Typography>
            )}

            {item.note && (
              <Typography 
                fontSize="15px" 
                sx={{ 
                  color: "#ddd",
                  fontStyle: "italic",
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "8px",
                  p: 1.5,
                }}
              >
                📝 หมายเหตุ: {item.note}
              </Typography>
            )}

            <Divider sx={{ borderColor: "rgba(255,255,255,0.2)" }} />

            <Typography fontSize="14px" sx={{ color: "#bbb" }}>
              🕒 วันที่บันทึก: {formattedCreatedAt}
            </Typography>
          </Stack>
        </Card>
      </motion.div>
    </Grid>
  );
});

// Loading Component
const LoadingComponent = React.memo(() => (
  <Box sx={{ position: "relative", minHeight: "100vh", overflowX: "hidden" }}>
    <BackgroundEffects />
    <Box
      sx={{
        position: "relative",
        zIndex: 2,
        px: { xs: 2, sm: 4, md: 6 },
        py: 8,
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
        กำลังโหลดประวัติการเติมเงิน...
      </Typography>
    </Box>
  </Box>
));

// Error Component
const ErrorComponent = React.memo(({ error, onRetry }) => (
  <Box sx={{ position: "relative", minHeight: "100vh", overflowX: "hidden" }}>
    <BackgroundEffects />
    <Box
      sx={{
        position: "relative",
        zIndex: 2,
        px: { xs: 2, sm: 4, md: 6 },
        py: 8,
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
  <Box
    sx={{
      textAlign: "center",
      py: 8,
      background: "rgba(255, 255, 255, 0.05)",
      borderRadius: "20px",
      mx: "auto",
      maxWidth: "600px",
    }}
  >
    <Typography
      variant="h5"
      fontWeight="bold"
      sx={{ color: "#fff", mb: 2 }}
    >
      💸 ยังไม่มีประวัติการเติมเงิน
    </Typography>
    <Typography sx={{ color: "#bbb" }}>
      เมื่อคุณเติมเงินแล้ว ประวัติจะแสดงที่นี่
    </Typography>
  </Box>
));

const TopupHistoryPage = () => {
  const [history, setHistory] = useState([]);
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
        `${process.env.REACT_APP_API}/topup/history`,
        config
      );
      setHistory(data.history || []);
    } catch (err) {
      console.error("❌ ไม่สามารถโหลดประวัติการเติมเงินได้", err);
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

  const handleRetry = useCallback(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Calculate total amount
  const totalAmount = useMemo(() => {
    return history
      .filter(item => item.status === "approved")
      .reduce((sum, item) => sum + (item.amount || 0), 0);
  }, [history]);

  // Early returns for loading and error states
  if (loading) {
    return <LoadingComponent />;
  }

  if (error) {
    return <ErrorComponent error={error} onRetry={handleRetry} />;
  }

  return (
    <Box sx={{ position: "relative", minHeight: "100vh", overflowX: "hidden" }}>
      <BackgroundEffects />

      <Box
        sx={{
          position: "relative",
          zIndex: 2,
          px: { xs: 2, sm: 4, md: 6 },
          py: 8,
        }}
      >
        <Typography
          variant="h4"
          fontWeight="bold"
          align="center"
          sx={{
            color: "#fff",
            mb: 6,
            textShadow: "0 0 10px #a855f7, 0 0 20px #9333ea",
          }}
        >
          💰 ประวัติการเติมเงิน
        </Typography>

        {/* Summary and Refresh Button */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          {history.length > 0 && (
            <Typography
              sx={{
                color: "#4ade80",
                fontSize: "18px",
                fontWeight: "bold",
                mb: 2,
              }}
            >
            </Typography>
          )}
          
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

        {/* History Cards */}
        {history.length === 0 ? (
          <EmptyStateComponent />
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
              พบประวัติ {history.length} รายการ
            </Typography>
            
            <Grid container spacing={4} justifyContent="center">
              {history.map((item, index) => (
                <TopupCard
                  key={`${item._id || index}-${item.createdAt}`}
                  item={item}
                  index={index}
                />
              ))}
            </Grid>
          </>
        )}
      </Box>
    </Box>
  );
};

export default TopupHistoryPage;