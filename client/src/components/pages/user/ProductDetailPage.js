import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Card,
  Divider,
  Grid,
  Stack,
  CircularProgress,
  Chip,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebook,
  faInstagram,
  faDiscord,
} from "@fortawesome/free-brands-svg-icons";
import RefreshIcon from "@mui/icons-material/Refresh";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import axios from "axios";
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
const CACHE_DURATION = 3 * 60 * 1000; // 3 minutes

// Optimized fetch with caching
const fetchWithCache = async (url, config = {}) => {
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
    <Particles
      particleCount={80} // Reduced for better performance
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

// Loading Component
const LoadingComponent = React.memo(() => (
  <Box
    sx={{
      position: "relative",
      minHeight: "100vh",
      background: "#000",
      color: "#fff",
      overflow: "hidden",
      py: 8,
    }}
  >
    <BackgroundEffects />
    <Box
      sx={{
        position: "relative",
        zIndex: 1,
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
        กำลังโหลดสินค้า...
      </Typography>
    </Box>
  </Box>
));

// Error Component
const ErrorComponent = React.memo(({ error, onRetry, onBack }) => (
  <Box
    sx={{
      position: "relative",
      minHeight: "100vh",
      background: "#000",
      color: "#fff",
      overflow: "hidden",
      py: 8,
    }}
  >
    <BackgroundEffects />
    <Box
      sx={{
        position: "relative",
        zIndex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "50vh",
        px: 3,
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
        ไม่พบสินค้า
      </Typography>
      <Typography sx={{ color: "#fff", mb: 3, textAlign: "center" }}>
        {error}
      </Typography>
      <Stack direction="row" spacing={2}>
        <Button
          onClick={onBack}
          startIcon={<ArrowBackIcon />}
          sx={{
            background: "rgba(255, 255, 255, 0.1)",
            color: "#fff",
            fontWeight: "bold",
            borderRadius: "999px",
            px: 3,
            py: 1,
            "&:hover": {
              background: "rgba(255, 255, 255, 0.2)",
            },
          }}
        >
          กลับไป
        </Button>
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
      </Stack>
    </Box>
  </Box>
));

// Social Links Component
const SocialLinks = React.memo(() => (
  <Box sx={{ textAlign: "left", mt: 2 }}>
    <Typography
      variant="subtitle1"
      sx={{
        color: "#fff",
        fontWeight: "bold",
        mb: 1,
        textShadow: "0 0 8px #c084fc",
      }}
    >
      ติดต่อเรา
    </Typography>
    <Box sx={{ display: "flex", justifyContent: "left", gap: 3 }}>
      <a
        href="https://www.facebook.com/eurotinnapat.saelee"
        target="_blank"
        rel="noopener noreferrer"
        style={{ transition: "transform 0.2s" }}
        onMouseOver={(e) => e.target.style.transform = "scale(1.2)"}
        onMouseOut={(e) => e.target.style.transform = "scale(1)"}
      >
        <FontAwesomeIcon 
          icon={faFacebook} 
          style={{ color: "#3b82f6", fontSize: "28px" }} 
        />
      </a>
      <a
        href="https://www.instagram.com/quax.tix/"
        target="_blank"
        rel="noopener noreferrer"
        style={{ transition: "transform 0.2s" }}
        onMouseOver={(e) => e.target.style.transform = "scale(1.2)"}
        onMouseOut={(e) => e.target.style.transform = "scale(1)"}
      >
        <FontAwesomeIcon 
          icon={faInstagram} 
          style={{ color: "#e1306c", fontSize: "28px" }} 
        />
      </a>
      <a
        href="https://discord.gg/"
        target="_blank"
        rel="noopener noreferrer"
        style={{ transition: "transform 0.2s" }}
        onMouseOver={(e) => e.target.style.transform = "scale(1.2)"}
        onMouseOut={(e) => e.target.style.transform = "scale(1)"}
      >
        <FontAwesomeIcon 
          icon={faDiscord} 
          style={{ color: "#7289da", fontSize: "28px" }} 
        />
      </a>
    </Box>
  </Box>
));

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [stockCount, setStockCount] = useState(0);
  const [isBuying, setIsBuying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const fetchStock = useCallback(async () => {
    try {
      const data = await fetchWithCache(`${process.env.REACT_APP_API}/stock/${id}`);
      const available = data.filter((s) => !s.isSold);
      setStockCount(available.length);
    } catch (err) {
      console.error("Failed to fetch stock:", err);
      setStockCount(0);
    }
  }, [id]);

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch single product directly if API supports it
      const data = await fetchWithCache(`${process.env.REACT_APP_API}/product`);
      const item = data.find((p) => p._id === id);
      
      if (!item) {
        throw new Error("ไม่พบสินค้าที่คุณต้องการ");
      }
      
      setProduct(item);
      await fetchStock();
    } catch (err) {
      console.error("Failed to fetch product:", err);
      setError(err.message || "ไม่สามารถโหลดข้อมูลสินค้าได้");
    } finally {
      setLoading(false);
    }
  }, [id, fetchStock]);

  useEffect(() => {
  window.scrollTo(0, 0);
    if (id) {
      fetchProduct();
    }
  }, [id, fetchProduct]);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleBuy = useCallback(async () => {
    if (isBuying || stockCount === 0) return;
    setIsBuying(true);

    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire({
        title: "กรุณาเข้าสู่ระบบ",
        text: "คุณต้องเข้าสู่ระบบก่อนซื้อสินค้า",
        icon: "warning",
        background: "rgba(30,30,40,0.95)",
        color: "#fff",
        confirmButtonColor: "#f59e0b",
      });
      setIsBuying(false);
      return;
    }

    const confirm = await Swal.fire({
      title: "ยืนยันการซื้อ",
      text: `คุณต้องการซื้อ "${product.name}" ในราคา ${product.price} POINT หรือไม่?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "ยืนยันการซื้อ",
      cancelButtonText: "ยกเลิก",
      background: "rgba(30,30,40,0.95)",
      color: "#fff",
      confirmButtonColor: "#6366f1",
      cancelButtonColor: "#6b7280",
    });

    if (!confirm.isConfirmed) {
      setIsBuying(false);
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await api.post(`${process.env.REACT_APP_API}/purchase/${id}`, {}, config);
      
      Swal.fire({
        title: "ซื้อสำเร็จ!",
        text: "ระบบจัดส่งไอดีเรียบร้อยแล้ว",
        icon: "success",
        background: "rgba(30,30,40,0.95)",
        color: "#fff",
        confirmButtonColor: "#10b981",
      }).then(() => {
        navigate("/user/history");
      });
      
      fetchStock(); // Refresh stock count
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data || "เกิดข้อผิดพลาด";
      
      Swal.fire({
        title: "ไม่สามารถซื้อได้",
        text: message,
        icon: "error",
        background: "rgba(30,30,40,0.95)",
        color: "#fff",
        confirmButtonColor: "#ef4444",
      });
      
      if (message.includes("token") || err.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setIsBuying(false);
    }
  }, [isBuying, stockCount, product, id, navigate, fetchStock]);

  const handleRetry = useCallback(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // Memoized stock status
  const stockStatus = useMemo(() => {
    if (stockCount === 0) return { text: "หมดสต็อก", color: "#ef4444" };
    if (stockCount <= 5) return { text: `เหลือน้อย (${stockCount} ชิ้น)`, color: "#f59e0b" };
    return { text: `มีสินค้า (${stockCount} ชิ้น)`, color: "#10b981" };
  }, [stockCount]);

  // Early returns for loading and error states
  if (loading) {
    return <LoadingComponent />;
  }

  if (error || !product) {
    return (
      <ErrorComponent 
        error={error || "ไม่พบสินค้า"} 
        onRetry={handleRetry}
        onBack={handleBack}
      />
    );
  }

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        background: "#000",
        color: "#fff",
        overflow: "hidden",
        py: 8,
      }}
    >
      <BackgroundEffects />

      <Box sx={{ position: "relative", zIndex: 1 }}>
        <Box maxWidth="1000px" mx="auto" px={3}>
          {/* Back Button */}
          <Button
            onClick={handleBack}
            startIcon={<ArrowBackIcon />}
            sx={{
              mb: 3,
              background: "rgba(255, 255, 255, 0.1)",
              color: "#fff",
              borderRadius: "999px",
              "&:hover": {
                background: "rgba(255, 255, 255, 0.2)",
              },
            }}
          >
            กลับ
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card
              sx={{
                p: { xs: 3, md: 5 },
                borderRadius: 4,
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                boxShadow: "0 0 50px rgba(147, 51, 234, 0.2)",
              }}
            >
              <Grid container spacing={4} alignItems="center">
                <Grid item xs={12} md={6}>
                  <Box sx={{ position: "relative" }}>
                    {!imageLoaded && (
                      <Box
                        sx={{
                          width: "100%",
                          height: "400px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "rgba(255, 255, 255, 0.1)",
                          borderRadius: "16px",
                        }}
                      >
                        <CircularProgress size={40} sx={{ color: "#a855f7" }} />
                      </Box>
                    )}
                    
                    <img
                      src={product.image}
                      alt={product.name}
                      onLoad={handleImageLoad}
                      style={{
                        width: "100%",
                        height: "100%",
                        maxHeight: 400,
                        objectFit: "cover",
                        borderRadius: "16px",
                        display: imageLoaded ? "block" : "none",
                      }}
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Stack spacing={3}>
                    <Typography 
                      variant="h4" 
                      fontWeight="bold" 
                      sx={{ 
                        color: "#fff",
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {product.name}
                    </Typography>
                    
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: "#ddd",
                        lineHeight: 1.6,
                      }}
                    >
                      {product.detail || "ไม่มีรายละเอียด"}
                    </Typography>

                    <SocialLinks />

                    <Divider sx={{ borderColor: "#555" }} />

                    <Box>
                      <Typography fontSize="18px" sx={{ color: "#fff", mb: 1 }}>
                        💰 <strong>ราคา:</strong>{" "}
                        <Box component="span" sx={{ color: "#4ade80", fontWeight: "bold" }}>
                          {product.price} POINT
                        </Box>
                      </Typography>
                      
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Typography fontSize="17px" sx={{ color: "#fff" }}>
                          📦 <strong>สถานะ:</strong>
                        </Typography>
                        <Chip
                          label={stockStatus.text}
                          size="small"
                          sx={{
                            backgroundColor: stockStatus.color,
                            color: "#fff",
                            fontWeight: "bold",
                          }}
                        />
                      </Box>
                    </Box>

                    <Button
                      onClick={handleBuy}
                      disabled={isBuying || stockCount === 0}
                      fullWidth
                      sx={{
                        background: stockCount === 0 
                          ? "rgba(255, 255, 255, 0.1)" 
                          : "linear-gradient(90deg, #6366f1, #a855f7)",
                        color: stockCount === 0 ? "#888" : "#fff",
                        fontWeight: "bold",
                        fontSize: "16px",
                        py: 1.5,
                        borderRadius: "999px",
                        textTransform: "none",
                        boxShadow: stockCount === 0 ? "none" : "0 0 15px rgba(147,51,234,0.4)",
                        "&:hover": stockCount === 0 ? {} : {
                          background: "linear-gradient(90deg, #7c3aed, #4f46e5)",
                          transform: "scale(1.02)",
                          boxShadow: "0 0 25px rgba(147,51,234,0.6)",
                        },
                      }}
                    >
                      {stockCount === 0 
                        ? "สินค้าหมด" 
                        : isBuying 
                        ? "กำลังซื้อ..." 
                        : "ซื้อสินค้า"
                      }
                    </Button>

                    {/* Refresh Stock Button */}
                    <Button
                      onClick={fetchStock}
                      size="small"
                      startIcon={<RefreshIcon />}
                      sx={{
                        color: "#bbb",
                        textTransform: "none",
                        "&:hover": {
                          color: "#fff",
                        },
                      }}
                    >
                      อัพเดทสต็อก
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </Card>
          </motion.div>
        </Box>
      </Box>
    </Box>
  );
};

export default ProductDetailPage;