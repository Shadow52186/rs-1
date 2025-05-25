import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import Swal from "sweetalert2";
import Particles from "../../../components/effects/Particles";
import Threads from "../../../components/effects/Threads";
import { motion } from "framer-motion";

const PurchaseHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };
        const res = await axios.get(
          `${process.env.REACT_APP_API}/purchase/history`,
          config
        );
        setHistory(res.data);
      } catch (err) {
        console.error("❌ ไม่สามารถโหลดประวัติได้", err);
      }
    };

    fetchHistory();
  }, [token]);

  const handleCopyChoice = (username, password) => {
    Swal.fire({
      title: "เลือกสิ่งที่คุณต้องการคัดลอก",
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: "🧑‍💻 Username",
      denyButtonText: "🔐 Password",
      cancelButtonText: "ยกเลิก",
    }).then((result) => {
      if (result.isConfirmed) {
        navigator.clipboard.writeText(username);
        Swal.fire("คัดลอกแล้ว", "Username ถูกคัดลอกแล้ว", "success");
      } else if (result.isDenied) {
        navigator.clipboard.writeText(password);
        Swal.fire("คัดลอกแล้ว", "Password ถูกคัดลอกแล้ว", "success");
      }
    });
  };

  return (
    <Box sx={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>
      {/* ✅ Background */}
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
            mb: 6,
            textShadow: "0 0 10px #a855f7, 0 0 20px #9333ea",
          }}
        >
          📜 ประวัติการซื้อสินค้า
        </Typography>

        <Grid container spacing={4} justifyContent="center">
          {history.map((item, index) => (
            <Grid
              item
              xs={12}
              sm={10}
              md={6}
              key={index}
              sx={{ display: "flex" }}
            >
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                style={{ width: "100%" }}
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
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <Tooltip title="เลือกสิ่งที่จะคัดลอก">
                    <IconButton
                      onClick={() =>
                        handleCopyChoice(item.username, item.password)
                      }
                      sx={{
                        position: "absolute",
                        top: 16,
                        right: 16,
                        color: "#c084fc",
                      }}
                    >
                      <ContentCopyIcon />
                    </IconButton>
                  </Tooltip>

                  <Stack spacing={1.5} mt={1}>
                    <Typography
                      fontWeight="bold"
                      fontSize="18px"
                      sx={{ color: "#fff" }}
                    >
                      📦 สินค้า: {item.product?.name}
                    </Typography>
                    <Typography fontSize="16px" sx={{ color: "#93c5fd" }}>
                      🧑‍💻 Username: {item.username}
                    </Typography>
                    <Typography fontSize="16px" sx={{ color: "#93c5fd" }}>
                      🔐 Password: {item.password}
                    </Typography>

                    <Divider sx={{ borderColor: "rgba(255,255,255,0.2)" }} />
                    <Typography fontSize="14px" sx={{ color: "#bbb" }}>
                      🕒 วันที่ซื้อ:{" "}
                      {new Date(item.createdAt).toLocaleString("th-TH", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
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

export default PurchaseHistoryPage;
