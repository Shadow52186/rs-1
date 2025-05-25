import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  Stack,
  Divider,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import Particles from "../../../components/effects/Particles";
import Threads from "../../../components/effects/Threads";
import { motion } from "framer-motion";

const UserProfilePage = () => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await axios.get(`${process.env.REACT_APP_API}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data);
      } catch (err) {
        console.error("โหลดข้อมูลผู้ใช้ล้มเหลว", err);
      }
    };

    fetchProfile();
  }, []);

  if (!profile)
    return (
      <Box
        sx={{
          display: "flex",
          height: "100vh",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
        }}
      >
        <CircularProgress sx={{ color: "#fff" }} />
      </Box>
    );

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        overflow: "hidden",
        py: 10,
        px: 3,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
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
        <Particles
          particleCount={300}
          particleColors={["#ffffff", "#bbf7ff", "#c084fc"]}
          particleBaseSize={80}
          moveParticlesOnHover
          particleHoverFactor={1.4}
          alphaParticles
        />
        <Threads
          color={[0.6, 0.3, 1]}
          amplitude={0.8}
          distance={0.0}
          enableMouseInteraction
        />
      </Box>

      {/* ✅ Profile Card */}
      <Box sx={{ zIndex: 1, width: "100%", maxWidth: 700, mt: -30 }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <Card
            sx={{
              px: { xs: 5, md: 7 },
              py: { xs: 7, md: 8 },
              borderRadius: 4,
              minHeight: 420,
              background: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(18px)",
              WebkitBackdropFilter: "blur(18px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 0 50px rgba(147, 51, 234, 0.2)",
              color: "#fff",
            }}
          >
            <Typography
              variant="h4"
              fontWeight="bold"
              align="center"
              gutterBottom
              sx={{
                mb: 4,
                textShadow: "0 0 12px #a855f7",
              }}
            >
              👤 ข้อมูลโปรไฟล์ของคุณ
            </Typography>

            <Divider sx={{ borderColor: "rgba(255,255,255,0.2)", mb: 4 }} />

            <Stack spacing={4} fontSize="20px">
              <Typography>
                👤 <strong>ชื่อผู้ใช้:</strong> {profile.username}
              </Typography>

              <Typography>
                🛡️ <strong>บทบาท:</strong>{" "}
                {profile.role === "admin" ? "ผู้ดูแลระบบ" : "ผู้ใช้งานทั่วไป"}
              </Typography>

              <Typography>
                💰 <strong>Point คงเหลือ:</strong>{" "}
                <span style={{ color: "#facc15", fontWeight: "bold" }}>
                  {profile.point ?? 0} point
                </span>
              </Typography>
            </Stack>
          </Card>
        </motion.div>
      </Box>
    </Box>
  );
};

export default UserProfilePage;
