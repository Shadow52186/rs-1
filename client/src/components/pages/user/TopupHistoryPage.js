import React, { useEffect, useState } from "react";
import { Box, Typography, Grid, Card, Stack, Divider } from "@mui/material";
import axios from "axios";
import Particles from "../../../components/effects/Particles";
import Threads from "../../../components/effects/Threads";
import { motion } from "framer-motion";

const TopupHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };
        const res = await axios.get(
          `${process.env.REACT_APP_API}/topup/history`,
          config
        );
        setHistory(res.data);
      } catch (err) {
        console.error("❌ ไม่สามารถโหลดประวัติการเติมเงินได้", err);
      }
    };

    fetchHistory();
  }, [token]);

  return (
    <Box sx={{ position: "relative", minHeight: "100vh", overflowX: "hidden" }}>
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
            distance={0}
            enableMouseInteraction
          />
        </Box>
      </Box>

      {/* Content */}
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

        <Grid container spacing={4} justifyContent="center">
          {history.map((item, index) => (
            <Grid item xs={12} sm={8} md={6} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card
                  sx={{
                    p: 3,
                    borderRadius: "20px",
                    background: "rgba(255,255,255,0.05)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    height: "200px", // ✅ ทำให้กรอบสูงสุดเท่ากันในแต่ละแถว
                    border: "1px solid rgba(255,255,255,0.1)",
                    boxShadow: "0 0 30px rgba(147,51,234,0.2)",
                  }}
                >
                  <Stack spacing={1.5}>
                    <Typography
                      fontWeight="bold"
                      fontSize="18px"
                      sx={{ color: "#fff" }}
                    >
                      ✅ จำนวนเงิน:{" "}
                      <Box component="span" sx={{ color: "#4ade80" }}>
                        {item.amount} บาท
                      </Box>
                    </Typography>
                    {item.note && (
                      <Typography fontSize="15px" sx={{ color: "#ddd" }}>
                        📝 หมายเหตุ: {item.note}
                      </Typography>
                    )}
                    <Divider sx={{ borderColor: "rgba(255,255,255,0.2)" }} />
                    <Typography fontSize="14px" sx={{ color: "#bbb" }}>
                      🕒 วันที่:{" "}
                      {new Date(item.createdAt).toLocaleString("th-TH")}
                    </Typography>
                  </Stack>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default TopupHistoryPage;
