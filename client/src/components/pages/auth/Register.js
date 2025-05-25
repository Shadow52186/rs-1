import React, { useState, useRef } from "react";
import {
  Box,
  Button,
  Card,
  CssBaseline,
  FormControl,
  FormLabel,
  TextField,
  Typography,
  Stack,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { useDispatch } from "react-redux";
import { login as loginRedux } from "../../../store/userSlice";
import ReCAPTCHA from "react-google-recaptcha";
import { motion } from "framer-motion";
import useMediaQuery from "@mui/material/useMediaQuery";
import Particles from "../../../components/effects/Particles";
import Threads from "../../../components/effects/Threads";

const RegisterForm = () => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const recaptchaRef = useRef();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password.length < 6) {
      Swal.fire({
        icon: "warning",
        title: "รหัสผ่านสั้นเกินไป",
        text: "กรุณากรอกรหัสผ่านอย่างน้อย 6 ตัวอักษร",
      });
      return;
    }

    if (!recaptchaToken) {
      Swal.fire("กรุณาติ๊กว่าไม่ใช่บอท", "", "warning");
      return;
    }

    try {
      await axios.post(`${process.env.REACT_APP_API}/register`, {
        ...form,
        recaptchaToken,
      });

      const res = await axios.post(`${process.env.REACT_APP_API}/login`, {
        ...form,
        recaptchaToken,
      });

      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);
      localStorage.setItem("username", user.username);

      dispatch(loginRedux({ username: user.username, role: user.role }));

      Swal.fire({
        title: "กำลังลงทะเบียน...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      setTimeout(() => {
        Swal.fire({
          icon: "success",
          title: "ลงทะเบียนสำเร็จ",
          text: "ระบบจะพาคุณเข้าสู่ระบบโดยอัตโนมัติ",
          timer: 1800,
          timerProgressBar: true,
          showConfirmButton: false,
        }).then(() => {
          navigate(user.role === "admin" ? "/admin/viewtable" : "/user/index");
        });
      }, 1000);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "ไม่สำเร็จ",
        text: "ลงทะเบียนไม่สำเร็จ หรือบัญชีนี้มีอยู่แล้ว",
        confirmButtonText: "ลองอีกครั้ง",
      });
    } finally {
      if (recaptchaRef.current) recaptchaRef.current.reset();
      setRecaptchaToken("");
    }
  };

  return (
    <>
      <CssBaseline />

      {/* ✅ Background Effects */}
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

      {/* ✅ Register Form */}
      <Box
        minHeight="100vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
        sx={{ position: "relative", zIndex: 2, px: 2 }}
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          style={{ width: "100%", maxWidth: 480 }}
        >
          <Card
            sx={{
              p: 5,
              borderRadius: 4,
              background: "rgba(255,255,255,0.05)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 0 30px rgba(147, 51, 234, 0.3)",
              color: "#fff",
            }}
          >
            <Typography
              variant="h4"
              fontWeight="bold"
              textAlign="center"
              mb={4}
              sx={{
                color: "#fff",
                textShadow: "0 0 10px #a855f7",
              }}
            >
              สมัครสมาชิก
            </Typography>

            <form onSubmit={handleSubmit}>
              <FormControl fullWidth margin="normal">
                <FormLabel sx={{ fontWeight: "bold", color: "#ddd" }}>
                  ชื่อผู้ใช้
                </FormLabel>
                <TextField
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="กรอกชื่อผู้ใช้"
                  required
                  InputProps={{
                    sx: {
                      borderRadius: "12px",
                      backgroundColor: "rgba(255,255,255,0.07)",
                      color: "#fff",
                    },
                  }}
                />
              </FormControl>

              <FormControl fullWidth margin="normal">
                <FormLabel sx={{ fontWeight: "bold", color: "#ddd" }}>
                  รหัสผ่าน
                </FormLabel>
                <TextField
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="กรอกรหัสผ่าน"
                  required
                  InputProps={{
                    sx: {
                      borderRadius: "12px",
                      backgroundColor: "rgba(255,255,255,0.07)",
                      color: "#fff",
                    },
                  }}
                />
              </FormControl>

              <Box mt={2} mb={3} textAlign="center">
                <ReCAPTCHA
                  sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
                  onChange={(token) => setRecaptchaToken(token)}
                  ref={recaptchaRef}
                  size={isMobile ? "compact" : "normal"}
                  theme="dark"
                />
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  py: 1.5,
                  fontWeight: "bold",
                  fontSize: "16px",
                  borderRadius: "999px",
                  background: "linear-gradient(90deg, #6366f1, #a855f7)",
                  color: "#fff",
                  boxShadow: "0 0 20px rgba(147, 51, 234, 0.4)",
                  "&:hover": {
                    background: "linear-gradient(90deg, #7c3aed, #4f46e5)",
                    transform: "scale(1.02)",
                  },
                }}
              >
                สมัครและเข้าสู่ระบบ
              </Button>

              <Stack alignItems="center" spacing={1} mt={3}>
                <Typography variant="body2" color="#ddd">
                  มีบัญชีอยู่แล้ว?{" "}
                  <Link
                    to="/login"
                    style={{
                      color: "#c084fc",
                      fontWeight: "bold",
                      textDecoration: "none",
                    }}
                  >
                    เข้าสู่ระบบ
                  </Link>
                </Typography>
              </Stack>
            </form>
          </Card>
        </motion.div>
      </Box>
    </>
  );
};

export default RegisterForm;
