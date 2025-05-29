import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Card,
  Divider,
  Grid,
  Stack,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebook,
  faInstagram,
  faDiscord,
} from "@fortawesome/free-brands-svg-icons";
import axios from "axios";
import Swal from "sweetalert2";
import Particles from "../../../components/effects/Particles";
import Threads from "../../../components/effects/Threads";
import { motion } from "framer-motion";

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [stockCount, setStockCount] = useState(0);
  const [isBuying, setIsBuying] = useState(false);

  const fetchStock = async () => {
    const res = await axios.get(`${process.env.REACT_APP_API}/stock/${id}`);
    const available = res.data.filter((s) => !s.isSold);
    setStockCount(available.length);
  };

  useEffect(() => {
    const fetchProduct = async () => {
      const res = await axios.get(`${process.env.REACT_APP_API}/product`);
      const item = res.data.find((p) => p._id === id);
      setProduct(item);
    };

    fetchProduct();
    fetchStock();
  }, [id]);

  const handleBuy = async () => {
    if (isBuying) return;
    setIsBuying(true);

    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire("กรุณาเข้าสู่ระบบ", "", "warning");
      setIsBuying(false);
      return;
    }

    const confirm = await Swal.fire({
      title: "คุณแน่ใจหรือไม่?",
      text: "คุณต้องการซื้อสินค้านี้หรือไม่?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "ยืนยันการซื้อ",
      cancelButtonText: "ยกเลิก",
    });

    if (!confirm.isConfirmed) {
      setIsBuying(false);
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post(`${process.env.REACT_APP_API}/purchase/${id}`, {}, config);
      Swal.fire("🎉 ซื้อสำเร็จ!", "ระบบจัดส่งไอดีเรียบร้อยแล้ว", "success").then(() => {
        navigate("/user/history");
      });
      fetchStock();
    } catch (err) {
      const message = err.response?.data || "เกิดข้อผิดพลาด";
      Swal.fire("ไม่สามารถซื้อได้", message, "error");
      if (message.includes("token")) {
        navigate("/login");
      }
    } finally {
      setIsBuying(false);
    }
  };

  if (!product)
    return (
      <Box textAlign="center" mt={10} color="#fff">
        กำลังโหลด...
      </Box>
    );

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
      {/* 🔮 Background Effects */}
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
          particleCount={300}
          particleColors={["#ffffff", "#bbf7ff", "#c084fc"]}
          particleBaseSize={80}
          moveParticlesOnHover
          particleHoverFactor={1.5}
          alphaParticles
        />
        <Threads
          color={[0.6, 0.3, 1]}
          amplitude={0.8}
          distance={0.0}
          enableMouseInteraction
        />
      </Box>

      {/* ✅ Content */}
      <Box sx={{ position: "relative", zIndex: 1 }}>
        <Box maxWidth="1000px" mx="auto" px={3}>
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
                  <img
                    src={product.image}
                    alt={product.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      maxHeight: 400,
                      objectFit: "cover",
                      borderRadius: "16px",
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Stack spacing={3}>
                    <Typography variant="h4" fontWeight="bold" sx={{ color: "#fff" }}>
                      🛒 {product.name}
                    </Typography>
                    <Typography variant="body1" sx={{ color: "#ddd" }}>
                      📃 {product.detail}
                    </Typography>
                    {/* ✅ Social Icons */}
                    <Box sx={{ textAlign: "left", mt: 4 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          color: "#fff",
                          fontWeight: "bold",
                          mb: 1,
                          textShadow: "0 0 8px #c084fc",
                        }}
                      >
                        
                      </Typography>
                      <Box sx={{ display: "flex", justifyContent: "left", gap: 4 }}>
                        <a
                          href="https://www.facebook.com/eurotinnapat.saelee"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <FontAwesomeIcon icon={faFacebook}  style={{ color: "#3b82f6" , fontSize: "25px" }} />
                        </a>
                        <a
                          href="https://www.instagram.com/quax.tix/"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <FontAwesomeIcon icon={faInstagram}  style={{ color: "#3b82f6" , fontSize: "25px" }} />
                        </a>
                        <a
                          href="https://discord.gg/"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <FontAwesomeIcon icon={faDiscord}  style={{ color: "#3b82f6" , fontSize: "25px" }} />
                        </a>
                      </Box>
                    </Box>

                    <Divider sx={{ borderColor: "#555" }} />

                    <Typography fontSize="17px" sx={{ color: "#fff" }}>
                      💰 <strong>ราคา:</strong>{" "}
                      <span style={{ color: "#93c5fd" }}>{product.price} point</span>
                    </Typography>
                    <Typography fontSize="17px" sx={{ color: "#fff" }}>
                      📦 <strong>จำนวนคงเหลือ:</strong>{" "}
                      <span style={{ color: "#facc15" }}>{stockCount} ชิ้น</span>
                    </Typography>

                    <Button
                      onClick={handleBuy}
                      disabled={isBuying}
                      fullWidth
                      sx={{
                        background: "linear-gradient(90deg, #6366f1, #a855f7)",
                        color: "#fff",
                        fontWeight: "bold",
                        fontSize: "16px",
                        py: 1.4,
                        borderRadius: "999px",
                        textTransform: "none",
                        boxShadow: "0 0 15px rgba(147,51,234,0.4)",
                        "&:hover": {
                          background: "linear-gradient(90deg, #7c3aed, #4f46e5)",
                          transform: "scale(1.03)",
                          boxShadow: "0 0 25px rgba(147,51,234,0.6)",
                        },
                      }}
                    >
                      {isBuying ? "⏳ กำลังซื้อ..." : "🛍️ ซื้อสินค้า"}
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
