import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Threads from "../../../components/effects/Threads";
import Particles from "../../../components/effects/Particles";
import SplashCursor from "../../../components/effects/SplashCursor";
import AnimatedContent from "../../../components/effects/AnimatedContent";

const WelcomePage = () => {
  const navigate = useNavigate();

  return (
    <>
      {/* ✅ SplashCursor ให้อยู่ล่างสุดแบบไม่รบกวน element อื่น */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 100,
          pointerEvents: "none",
        }}
      >
        <SplashCursor />
      </Box>

      {/* ✅ พื้นหลัง Threads และ Particles */}
      <Box
        sx={{
          position: "absolute",
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

      {/* ✅ Main Content */}
      <Box
        sx={{
          minHeight: "100vh",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
          position: "relative",
          fontFamily: "'Prompt', sans-serif",
          textAlign: "center",
          px: 2,
        }}
      >
        <AnimatedContent direction="vertical" distance={80} delay={0}>
          <img
            src={`${process.env.PUBLIC_URL}/assets/logo 3.png`}
            alt="RS-SHOP Logo"
            style={{
              width: "200px",
              marginBottom: "24px",
              borderRadius: "12px",
              filter: "drop-shadow(0 0 15px #a855f7) drop-shadow(0 0 25px #c084fc)",
            }}
          />
        </AnimatedContent>

        <AnimatedContent direction="vertical" distance={60} delay={100}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: "bold",
              color: "#fff",
              mb: 1,
              textShadow: "0 0 10px #a855f7, 0 0 20px #9333ea, 0 0 30px #6366f1",
            }}
          >
            ยินดีต้อนรับสู่ RS-SHOP
          </Typography>
        </AnimatedContent>

        <AnimatedContent direction="vertical" distance={50} delay={200}>
          <Typography
            variant="h6"
            sx={{
              color: "#ccc",
              mb: 4,
              textShadow: "0 0 10px rgba(255,255,255,0.2)",
            }}
          >
            เว็บขายไอดีเกมคุณภาพ ราคาถูก ปลอดภัย
          </Typography>
        </AnimatedContent>

        <AnimatedContent direction="vertical" distance={30} delay={300}>
          <Box display="flex" gap={2} justifyContent="center">
            <Button
              onClick={() => navigate("/login")}
              variant="contained"
              sx={{
                background: "linear-gradient(90deg, #a855f7, #6366f1)",
                color: "#fff",
                px: 5,
                py: 1.8,
                fontSize: "16px",
                fontWeight: "bold",
                borderRadius: "50px",
                boxShadow: "0 0 25px rgba(168,85,247,0.5)",
                textTransform: "none",
                "&:hover": {
                  background: "linear-gradient(90deg, #9333ea, #4f46e5)",
                  boxShadow: "0 0 40px rgba(138,43,226,0.7)",
                },
              }}
            >
              เข้าสู่ระบบ
            </Button>
            <Button
              onClick={() => navigate("/user/index")}
              variant="outlined"
              sx={{
                borderColor: "#fff",
                color: "#fff",
                fontWeight: "bold",
                px: 5,
                py: 1.8,
                fontSize: "16px",
                borderRadius: "50px",
                textTransform: "none",
                "&:hover": {
                  background: "#fff",
                  color: "#9333ea",
                },
              }}
            >
              หน้าแรก
            </Button>
          </Box>
        </AnimatedContent>
      </Box>
    </>
  );
};

export default WelcomePage;
