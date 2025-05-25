import React, { useState } from "react";
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  Stack,
  CardContent,
} from "@mui/material";
import Swal from "sweetalert2";
import axios from "axios";
import Particles from "../../../components/effects/Particles";
import Threads from "../../../components/effects/Threads";
import { motion } from "framer-motion";

const TopupPage = () => {
  const [link, setLink] = useState("");
  const token = localStorage.getItem("token");
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const [isLoading, setIsLoading] = useState(false);

  const handleRedeemTopup = async () => {
    if (!link || !link.includes("truemoney.com")) {
      return Swal.fire("ลิงก์ไม่ถูกต้อง", "กรุณาวางลิงก์ซองอั่งเปา", "warning");
    }
    if (!token) return Swal.fire("กรุณาเข้าสู่ระบบ", "", "warning");

    setIsLoading(true); // ✅ เริ่มโหลด

    try {
      const loading = Swal.fire({
        title: "กำลังตรวจสอบซอง...",
        text: "โปรดรอสักครู่",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const res = await axios.post(
        `${process.env.REACT_APP_API}/topup/redeem`,
        { link },
        config
      );

      Swal.fire("✅ สำเร็จ", res.data.message, "success");
      setLink("");
    } catch (err) {
      Swal.fire(
        "❌ ล้มเหลว",
        err.response?.data?.error || "เกิดข้อผิดพลาด",
        "error"
      );
    } finally {
      setIsLoading(false); // ✅ จบโหลด
    }
  };

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        overflow: "hidden",
        bgcolor: "#000",
      }}
    >
      {/* ✅ Background Effects */}
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
            particleCount={300}
            particleColors={["#ffffff", "#bbf7ff", "#c084fc"]}
            particleBaseSize={80}
            moveParticlesOnHover={true}
            particleHoverFactor={1.5}
            alphaParticles={true}
          />
        </Box>
        <Box sx={{ position: "absolute", inset: 0, zIndex: 1 }}>
          <Threads
            color={[0.6, 0.3, 1]}
            amplitude={0.8}
            distance={0.0}
            enableMouseInteraction={true}
          />
        </Box>
      </Box>

      {/* ✅ Form Content */}
      <Box
        sx={{
          px: 2,
          py: 12,
          maxWidth: "600px",
          mx: "auto",
          position: "relative",
          zIndex: 2,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <Card
            sx={{
              p: 4,
              borderRadius: "20px",
              background: "rgba(255, 255, 255, 0.06)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              boxShadow: "0 0 50px rgba(147, 51, 234, 0.2)",
            }}
          >
            <CardContent>
              <Typography
                variant="h5"
                fontWeight="bold"
                align="center"
                sx={{
                  mb: 2,
                  color: "#fff",
                  textShadow: "0 0 10px #a855f7",
                }}
              >
                เติม Point ด้วยซองอั่งเปา 🎁
              </Typography>

              <Typography
                variant="body1"
                align="center"
                sx={{ mb: 3, color: "#ddd" }}
              >
                วางลิงก์ <b>ซองอั่งเปา TrueMoney</b> เพื่อเติม Point ได้ทันที
              </Typography>

              <Box sx={{ textAlign: "center", mb: 3 }}>
                <img
                  src={`${process.env.PUBLIC_URL}/assets/aungpao_truewallet_01.jpg`}
                  alt="ซองอั่งเปา"
                  style={{
                    width: "100%",
                    maxWidth: 300,
                    borderRadius: 16,
                    boxShadow: "0 0 20px #a855f7",
                  }}
                />
              </Box>

              <Stack spacing={2}>
                <TextField
                  fullWidth
                  variant="outlined"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://gift.truemoney.com/campaign/?v=..."
                  InputProps={{
                    sx: {
                      background: "rgba(255, 255, 255, 0.1)",
                      borderRadius: 2,
                      input: { color: "#fff" },
                    },
                  }}
                  InputLabelProps={{ sx: { color: "#aaa" } }}
                />

                <Button
                  fullWidth
                  onClick={handleRedeemTopup}
                  disabled={isLoading}
                  sx={{
                    opacity: isLoading ? 0.7 : 1,
                    cursor: isLoading ? "not-allowed" : "pointer",
                    background: "linear-gradient(90deg, #9333ea, #4f46e5)",
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: "16px",
                    borderRadius: "999px",
                    textTransform: "none",
                    boxShadow: "0 0 20px rgba(168,85,247,0.4)",
                    py: 1.4,
                    transition: "0.3s",
                    "&:hover": {
                      background: "linear-gradient(90deg, #7e22ce, #3b82f6)",
                      transform: "scale(1.03)",
                      boxShadow: "0 0 25px rgba(147,51,234,0.6)",
                    },
                  }}
                >
                  🚀{" "}
                  {isLoading ? "กำลังตรวจสอบ..." : "เติม Point ด้วยซองอั่งเปา"}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </motion.div>
      </Box>
    </Box>
  );
};

export default TopupPage;
