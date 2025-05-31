import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  Stack,
  CardContent,
  Grid,
  Alert,
} from "@mui/material";
import Swal from "sweetalert2";
import axios from "axios";
import Particles from "../../../components/effects/Particles";
import Threads from "../../../components/effects/Threads";
import { motion } from "framer-motion";
import jsQR from "jsqr";


const TopupPage = () => {
  const [link, setLink] = useState("");
  const [slipFile, setSlipFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userBalance, setUserBalance] = useState(0);
  const token = localStorage.getItem("token");
  const config = { headers: { Authorization: `Bearer ${token}` } };
  

// ฟังก์ชันที่ใช้ในการดึง token จาก localStorage และใช้ใน headers
const getAuthConfig = () => {
  const token = localStorage.getItem("token");  // ดึง token จาก localStorage
  if (!token) {
    throw new Error("กรุณาเข้าสู่ระบบใหม่");
  }
  return { headers: { Authorization: `Bearer ${token}` } };  // ส่ง token ใน headers
};

  // ✅ ตรวจสอบสถานะการเข้าสู่ระบบ
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const config = getAuthConfig();
        const res = await axios.get(
          `${process.env.REACT_APP_API}/user/balance`,
          config
        );
        setUserBalance(res.data.balance || 0);
      } catch (err) {
        if (err.response?.status === 401) {
          Swal.fire("กรุณาเข้าสู่ระบบใหม่", "", "warning");
        }
      }
    };
    checkAuth();
  }, []);

  // ✅ ตรวจสอบลิงก์ TrueMoney
  const validateTrueMoneyLink = (url) => {
    const validDomains = ["gift.truemoney.com", "tmn.app", "www.truemoney.com"];

    try {
      const urlObj = new URL(url);
      return validDomains.some((domain) => urlObj.hostname.includes(domain));
    } catch {
      return false;
    }
  };

  // ฟังก์ชันจัดการการเติมเงิน
  const handleRedeemTopup = async () => {
    if (!link || !link.includes("truemoney.com")) {
      return Swal.fire("ลิงก์ไม่ถูกต้อง", "กรุณาวางลิงก์ซองอั่งเปา", "warning");
    }
    if (!token) return Swal.fire("กรุณาเข้าสู่ระบบ", "", "warning");

    try {
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
    }
  };
  const readQRFromImage = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.src = reader.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const qr = jsQR(imageData.data, img.width, img.height);
        if (qr && qr.data) resolve(qr.data);
        else reject(new Error("❌ ไม่พบ QR Code ในภาพ"));
      };
      img.onerror = () => reject(new Error("❌ โหลดรูปภาพไม่สำเร็จ"));
    };
    reader.onerror = () => reject(new Error("❌ อ่านไฟล์ไม่สำเร็จ"));
    reader.readAsDataURL(file);
  });
  // ✅ ฟังก์ชันการอัพโหลดไฟล์สลิป
  const handleSlipChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // ตรวจสอบประเภทไฟล์
      if (!file.type.startsWith("image/")) {
        Swal.fire("ไฟล์ไม่ถูกต้อง", "กรุณาเลือกไฟล์รูปภาพเท่านั้น", "warning");
        return;
      }

      // ตรวจสอบขนาดไฟล์ (ไม่เกิน 5MB)
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire(
          "ไฟล์ใหญ่เกินไป",
          "กรุณาเลือกไฟล์ที่มีขนาดไม่เกิน 5MB",
          "warning"
        );
        return;
      }

      setSlipFile(file);
    }
  };


  // ✅ ตรวจสอบสลิป
const handleVerifySlip = async () => {
  try {
    if (!slipFile) {
      return Swal.fire(
        "กรุณาเลือกสลิป",
        "โปรดอัปโหลดรูปภาพที่มี QR Code",
        "warning"
      );
    }

    setIsLoading(true);
    Swal.fire({
      title: "กำลังตรวจสอบ QR Code...",
      text: "กรุณารอสักครู่",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    // ✅ อ่าน QR จากรูปภาพ
    const qrData = await readQRFromImage(slipFile);
    console.log("QR ที่อ่านได้:", qrData);

    // ✅ เรียก backend API พร้อม token
    const config = getAuthConfig();
    const res = await axios.post(
      `${process.env.REACT_APP_API}/topup/slip/verify`,
      { qrcode_text: qrData },
      config
    );

    // ✅ ถ้าสำเร็จ
    if (res.data.status === "success") {
      await Swal.fire({
        icon: "success",
        title: "✅ เติมเงินสำเร็จ!",
        html: `
          <p>จำนวนเงิน: <b>${res.data.amount} บาท</b></p>
        `,
      });

      setSlipFile(null);
      document.getElementById("slip-upload").value = "";
      setUserBalance(res.data.balance);
    }

  } catch (err) {
    console.error("Slip verification error:", err);

    let errorMessage = "เกิดข้อผิดพลาดในการตรวจสอบสลิป";

    // ✅ ตรวจสอบสถานะ Error
    if (err.response?.status === 401) {
      errorMessage = "กรุณาเข้าสู่ระบบใหม่";
    } else if (err.response?.status === 400) {
      errorMessage = err.response.data?.error || "ข้อมูลไม่ถูกต้อง";
    } else if (err.response?.status === 409) {
      errorMessage = "❌ สลิปนี้ถูกใช้งานแล้ว กรุณาใช้สลิปใหม่";
    } else if (err.response?.data?.error) {
      errorMessage = err.response.data.error;
    }

    Swal.fire({
      icon: "error",
      title: "ตรวจสอบสลิปไม่สำเร็จ",
      text: errorMessage,
    });
  } finally {
    setIsLoading(false);
  }
};


  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        bgcolor: "#000",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
      >
        <Particles
          particleCount={300}
          particleColors={["#ffffff", "#bbf7ff", "#c084fc"]}
          particleBaseSize={80}
          moveParticlesOnHover={true}
          particleHoverFactor={1.5}
          alphaParticles={true}
        />
        <Threads
          color={[0.6, 0.3, 1]}
          amplitude={0.8}
          distance={0.0}
          enableMouseInteraction={true}
        />
      </Box>

      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
          position: "relative",
          zIndex: 2,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
         

          <Grid container spacing={4} sx={{ maxWidth: "1200px", mx: "auto" }}>
            {/* ซองอั่งเปา */}
            <Grid item xs={12} md={6}>
              <Card sx={cardStyle}>
                <CardContent>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    align="center"
                    sx={{ mb: 2, color: "#00e5ff" }}
                  >
                    เติม Point ด้วยซองอั่งเปา 🎁
                  </Typography>

                  <Typography
                    variant="body1"
                    align="center"
                    sx={{ mb: 3, color: "#00e5ff" }}
                  >
                    กรุณาสร้าง <b>ซองอั่งเปา TrueMoney</b>{" "}
                    และนำลิงก์มาใส่ด้านล่าง
                  </Typography>

                  <Box sx={{ textAlign: "center", mb: 3 }}>
                    <img
                      src={`${process.env.PUBLIC_URL}/assets/aungpao_truewallet_01.jpg`}
                      alt="ตัวอย่างซองอั่งเปา"
                      style={{
                        width: "100%",
                        maxWidth: 300,
                        borderRadius: 12,
                        boxShadow: "0 0 15px #00e5ff",
                      }}
                    />
                  </Box>

                  <Stack spacing={2}>
                    <TextField
                      fullWidth
                      label="ลิงก์ซองอั่งเปา TrueMoney"
                      variant="outlined"
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      InputProps={{
                        sx: {
                          background: "#2c2c2c",
                          borderRadius: 2,
                          input: { color: "#fff" },
                        },
                      }}
                      InputLabelProps={{ sx: { color: "#ccc" } }}
                    />

                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={handleRedeemTopup}
                      disabled={isLoading}
                      sx={{
                        color: "#fff", // สีตัวอักษรเป็นขาว
                        borderColor: "#9333ea", // สีขอบปุ่มเป็นน้ำเงิน (เหมือนปุ่มยืนยันสลิป)
                        fontWeight: "bold", // ตัวอักษรหนา
                        fontSize: "16px", // ขนาดตัวอักษร
                        textTransform: "none", // ไม่ต้องแปลงข้อความเป็นตัวพิมพ์ใหญ่
                        "&:hover": {
                          backgroundColor: "#9333ea", // สีพื้นหลังเมื่อ hover เป็นน้ำเงิน
                          borderColor: "#9333ea", // ขอบยังคงเป็นน้ำเงินเมื่อ hover
                          color: "#fff", // ตัวอักษรยังคงเป็นสีขาวเมื่อ hover
                        },
                      }}
                    >
                      ✅ เติมด้วยซองอั่งเปา
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* สลิปโอนเงิน */}
            <Grid item xs={12} md={6}>
              <Card sx={cardStyle}>
                <CardContent>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    align="center"
                    sx={titleStyle}
                  >
                    ยืนยันสลิปโอนเงิน 💸
                  </Typography>
                  <Typography
                    variant="body1"
                    align="center"
                    sx={{ mb: 3, color: "#ddd" }}
                  >
                    สลิปห้ามมีอายุเกิน 5 นาที และต้องโอนเข้าบัญชีที่ระบุ
                  </Typography>
                  <Box sx={{ textAlign: "center", mb: 2 }}>
                    <img
                      src={`${process.env.PUBLIC_URL}/assets/qr_bank.jpg`}
                      alt="QR โอนเงิน"
                      style={{
                        width: "100%",
                        maxWidth: 260,
                        borderRadius: 16,
                        boxShadow: "0 0 20px #0ea5e9",
                      }}
                    />
                    <Typography mt={2} sx={{ color: "#ddd", fontSize: "1rem" }}>
                      ธ.กสิกรไทย - 157-1-31795-4 (ทินภัทร แซ่ลี้)
                    </Typography>
                  </Box>
                  <Box
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files.length > 0) {
                        const file = e.dataTransfer.files[0];
                        if (file.type.startsWith("image/")) {
                          setSlipFile(file);
                          document.getElementById("slip-upload").files =
                            e.dataTransfer.files;
                        } else {
                          Swal.fire(
                            "ไฟล์ไม่ถูกต้อง",
                            "กรุณาเลือกไฟล์รูปภาพเท่านั้น",
                            "warning"
                          );
                        }
                      }
                    }}
                    sx={{
                      border: "2px dashed #ccc",
                      borderRadius: "12px",
                      p: 3,
                      textAlign: "center",
                      bgcolor: "rgba(255,255,255,0.05)",
                      color: "#ccc",
                      "&:hover": {
                        borderColor: "#a855f7",
                        bgcolor: "rgba(255,255,255,0.08)",
                        color: "#fff",
                      },
                      mb: 2,
                    }}
                  >
                    <Typography sx={{ mb: 1 }}>
                      {slipFile
                        ? `📎 เลือกแล้ว: ${slipFile.name}`
                        : "ลากสลิปมาวางที่นี่ หรือเลือกไฟล์ (PNG, JPG, JPEG ไม่เกิน 5MB)"}
                    </Typography>
                    <Button component="label" sx={uploadButtonStyle}>
                      เลือกไฟล์สลิป
                      <input
                        type="file"
                        id="slip-upload"
                        accept="image/png,image/jpg,image/jpeg"
                        hidden
                        onChange={handleSlipChange}
                      />
                    </Button>
                  </Box>
                  <Button
                    fullWidth
                    onClick={handleVerifySlip}
                    disabled={isLoading}
                    sx={buttonStyle(isLoading)}
                  >
                    📤{" "}
                    {isLoading ? "กำลังตรวจสอบ..." : "ตรวจสอบสลิปและเติม Point"}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </motion.div>
      </Box>
    </Box>
  );
};

// ✅ Styles (เหมือนเดิม)
const cardStyle = {
  p: 4,
  borderRadius: "20px",
  background: "rgba(255, 255, 255, 0.06)",
  backdropFilter: "blur(16px)",
  border: "1px solid rgba(255, 255, 255, 0.12)",
  boxShadow: "0 0 50px rgba(147, 51, 234, 0.2)",
};

const titleStyle = {
  mb: 2,
  color: "#fff",
  textShadow: "0 0 10px #a855f7",
};

const imageStyle = {
  width: "100%",
  maxWidth: 300,
  borderRadius: 16,
  boxShadow: "0 0 20px #a855f7",
};

const inputStyle = {
  sx: {
    background: "rgba(255, 255, 255, 0.1)",
    borderRadius: 2,
    input: { color: "#fff" },
  },
};

const buttonStyle = (loading) => ({
  opacity: loading ? 0.7 : 1,
  cursor: loading ? "not-allowed" : "pointer",
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
});

const uploadButtonStyle = {
  color: "#fff",
  borderRadius: "999px",
  background: "linear-gradient(90deg, #9333ea, #4f46e5)",
  px: 4,
  py: 1.2,
  mt: 1,
  fontWeight: "bold",
  textTransform: "none",
  "&:hover": {
    background: "linear-gradient(90deg, #7e22ce, #3b82f6)",
  },
};

export default TopupPage;
