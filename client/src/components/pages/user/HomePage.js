import { useNavigate } from "react-router-dom";
import React, { useRef, useEffect, useState } from "react";
import { Box, Typography, Button, Grid } from "@mui/material";
import CountUp from "react-countup";
import axios from "axios";
import Threads from "../../../components/effects/Threads";
import Particles from "../../../components/effects/Particles";
import BlurText from "../../../components/effects/BlurText";
import TiltedCard from "../../../components/effects/TiltedCard";
import { motion } from "framer-motion";

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState([
    { label: "ผู้ใช้งาน", value: 0, suffix: "" },
    { label: "ยอดขายสำเร็จ", value: 0, suffix: "" },
    { label: "สินค้าในระบบ", value: 0, suffix: "" },
  ]);

  const categoryRef = useRef(null);
  const navigate = useNavigate();

  const scrollToCategories = () => {
    categoryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API}/categories`);
        setCategories(res.data);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };

    const fetchStats = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API}/stats`);
        const data = res.data;
        setStats([
          { label: "ผู้ใช้งาน", value: data.users || 0, suffix: "" },
          { label: "ยอดขายสำเร็จ", value: data.sold || 0, suffix: "" },
          { label: "สินค้าในระบบ", value: data.products || 0, suffix: "" },
        ]);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
    };

    fetchCategories();
    fetchStats();
  }, []);

  return (
    <Box sx={{ position: "relative", width: "100%", overflowX: "hidden" }}>
      {/* Background */}
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
            moveParticlesOnHover
            particleHoverFactor={1.5}
            alphaParticles
          />
        </Box>
        <Box sx={{ position: "absolute", inset: 0, zIndex: 1 }}>
          <Threads
            color={[0.6, 0.3, 1]}
            amplitude={0.8}
            distance={0.0}
            enableMouseInteraction
          />
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ px: 2 }}>
        <Box
          sx={{
            width: "100%",
            maxWidth: "1500px",
            mx: "auto",
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: "center",
            gap: 6,
            py: { xs: 5, md: 5 },
            mt: { xs: "-70px", md: "-70px" },
            minHeight: "100vh",
          }}
        >
          {/* Left Text */}
          <Box sx={{ maxWidth: 600, textAlign: { xs: "center", md: "left" } }}>
            <Box sx={{ display: "flex", justifyContent: { xs: "center", md: "flex-start" }, mb: -2 }}>
              <Box
                component="img"
                src={`${process.env.PUBLIC_URL}/assets/logo 3.png`}
                alt="RS-SHOP Logo"
                sx={{
                  width: { xs: "140px", sm: "180px", md: "200px" },
                  height: "auto",
                  cursor: "pointer",
                  zIndex: 20,
                }}
                onClick={() => navigate("/")}
              />
            </Box>

            <BlurText
              text="RS-Shop"
              delay={80}
              animateBy="letters"
              direction="top"
              stepDuration={0.4}
              style={{
                fontSize: "clamp(32px, 6vw, 64px)",
                fontWeight: 800,
                fontFamily: "Orbitron, sans-serif",
                color: "#fff",
                marginBottom: "24px",
                textShadow: `0 0 10px #a855f7, 0 0 20px #9333ea, 0 0 40px #6366f1`,
                textTransform: "uppercase",
              }}
            />
            <BlurText
              text="เว็บขายไอดีเกมราคาถูกสุด ปลอดภัยทันใจ"
              delay={100}
              animateBy="words"
              direction="top"
              stepDuration={0.4}
              style={{
                fontSize: "clamp(20px, 4vw, 28px)",
                fontWeight: 800,
                color: "#fff",
                marginBottom: "24px",
                textShadow: `0 0 10px #a855f7, 0 0 20px #9333ea, 0 0 40px #6366f1`,
                textTransform: "uppercase",
              }}
            />
            <BlurText
              text="เลือกซื้อไอดีเกมดังหลากหลาย อัปเดตรายวัน ได้รับทันทีหลังชำระเงิน"
              delay={60}
              animateBy="words"
              direction="top"
              stepDuration={0.35}
              style={{
                fontSize: "clamp(14px, 3vw, 18px)",
                color: "#fff",
                marginBottom: "24px",
                textShadow: `0 0 10px #a855f7, 0 0 20px #9333ea, 0 0 40px #6366f1`,
                textTransform: "uppercase",
              }}
            />
            <Button
              onClick={() => navigate("/products")}
              sx={{
                background: "linear-gradient(90deg, #a855f7, #6366f1)",
                color: "#fff",
                px: 5,
                py: 1.8,
                fontSize: "16px",
                borderRadius: "50px",
                boxShadow: "0 0 25px rgba(168,85,247,0.5)",
                textTransform: "none",
                transition: "0.3s",
                "&:hover": {
                  background: "linear-gradient(90deg, #9333ea, #4f46e5)",
                  boxShadow: "0 0 40px rgba(138,43,226,0.7)",
                },
              }}
            >
              เริ่มต้นเลือกไอดีเกม
            </Button>

            <Grid container spacing={4} sx={{ mt: 6, mb: { xs: 8, md: 0 } }}>
              {stats.map((stat, i) => (
                <Grid item xs={12} sm={4} key={i} textAlign="center">
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 800,
                      fontFamily: "Orbitron, sans-serif",
                      textShadow: "0 0 10px #93c5fd",
                      color: "#c084fc",
                    }}
                  >
                    <CountUp
                      end={stat.value}
                      duration={2.5}
                      separator=","
                      suffix={stat.suffix}
                    />
                  </Typography>
                  <Typography sx={{ color: "#ccc", fontWeight: "bold", mt: 1 }}>
                    {stat.label}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Right Image */}
          <Box
            sx={{
              width: { xs: "100%", md: "50%" },
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              mt: { xs: 4, md: 0 },
              height: "auto",
              maxHeight: { xs: "auto", md: 700 },
            }}
          >
            <Box
              sx={{
                position: "absolute",
                width: { xs: "90%", md: 300 },
                height: { xs: 300, md: 600 },
                borderRadius: "30px",
                background:
                  "radial-gradient(circle, rgba(255,255,255,0.2), rgba(147,197,253,0.4), transparent)",
                filter: "blur(60px)",
                boxShadow: "0 0 40px rgba(136, 0, 255, 0.5)",
                zIndex: -1,
              }}
            />
            <Box
              onClick={scrollToCategories}
              sx={{ cursor: "pointer", width: "100%", maxWidth: 450 }}
            >
              <TiltedCard
                imageSrc={`${process.env.PUBLIC_URL}/assets/Roblox ID.png`}
                altText="สินค้าเด่น"
                captionText="คลิกเพื่อดูสินค้า"
                containerWidth="100%"
                containerHeight={window.innerWidth < 600 ? "700px" : "600px"}
                imageWidth="100%"
                imageHeight="100%"
                scaleOnHover={1.2}
                rotateAmplitude={15}
                showTooltip={true}
                showMobileWarning={false}
                displayOverlayContent={true}
                imageStyle={{
                  borderRadius: "20px",
                  transition: "0.4s",
                  filter: `brightness(2) contrast(2) saturate(2.2) drop-shadow(0 0 25px #93c5fd) drop-shadow(0 0 45px #a855f7) drop-shadow(0 0 80px #c084fc)`,
                  boxShadow: "0 0 40px rgba(136, 0, 255, 0.5)",
                  objectFit: "cover",
                }}
                overlayContent={
                  <Box
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(30%, -50%)",
                      color: "#fff",
                      fontWeight: "bold",
                      fontSize: "clamp(15px, 4vw, 25px)",
                      textShadow: "0 0 15px rgba(61, 61, 61, 0.9), 0 0 25px #a855f7",
                      textAlign: "center",
                      whiteSpace: "nowrap",
                      zIndex: 2,
                    }}
                  >
                    กดเพื่อดูหมวดหมู่สินค้า
                  </Box>
                }
              />
            </Box>
          </Box>
        </Box>

        {/* Categories */}
        <Box
          ref={categoryRef}
          sx={{
            width: "100%",
            maxWidth: "1300px",
            mx: "auto",
            px: 2,
            filter: "brightness(1.3)",
            py: 8,
            zIndex: 300,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              color: "#fff",
              textAlign: "center",
              mb: 10,
              fontWeight: "bold",
              textShadow: "0 0 10px #a855f7",
              mt: 6,
            }}
          >
            หมวดหมู่สินค้า
          </Typography>

          <Grid container spacing={4} justifyContent="center">
            {categories.map((cat) => (
              <Grid item xs={12} sm={6} key={cat._id}>
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <Box
                    onClick={() => {
                      navigate(`/category/${cat._id}`);
                      window.location.reload();
                      window.scrollTo(0, 0);
                    }}
                    sx={{
                      backgroundColor: "#1f1f1f",
                      borderRadius: "20px",
                      boxShadow: "0 0 30px rgba(168,85,247,0.3)",
                      overflow: "hidden",
                      cursor: "pointer",
                      transition: "0.3s",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      "&:hover": {
                        transform: "scale(1.02)",
                        boxShadow: "0 0 40px rgba(168,85,247,0.5)",
                        zIndex: 300,
                      },
                    }}
                  >
                    <img
                      src={cat.image}
                      alt={cat.name}
                      style={{
                        width: "100%",
                        height: "auto",
                        maxWidth: "550px",
                        maxHeight: "350px",
                        objectFit: "cover",
                        borderTopLeftRadius: "20px",
                        borderTopRightRadius: "20px",
                      }}
                    />
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default HomePage;
