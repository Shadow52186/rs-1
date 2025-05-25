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
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { useDispatch } from "react-redux";
import { login as loginRedux } from "../../../store/userSlice";
import ReCAPTCHA from "react-google-recaptcha";
import { motion } from "framer-motion";
import useMediaQuery from "@mui/material/useMediaQuery";
import Particles from "../../../components/effects/Particles";
import Threads from "../../../components/effects/Threads";

const Login = () => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const recaptchaRef = useRef();

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!recaptchaToken) {
      Swal.fire("กรุณาติ๊กว่าไม่ใช่บอท", "", "warning");
      return;
    }

    try {
      const res = await axios.post(`${process.env.REACT_APP_API}/login`, {
        ...form,
        recaptchaToken,
      });

      const token = res.data.token;
      const role = res.data.user.role;
      const username = res.data.user.username;

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("username", username);

      dispatch(loginRedux({ username, role }));

      Swal.fire({
        title: "กำลังเข้าสู่ระบบ...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      setTimeout(() => {
        Swal.fire({
          icon: "success",
          title: "เข้าสู่ระบบสำเร็จ",
          timer: 1500,
          timerProgressBar: true,
          showConfirmButton: false,
        }).then(() => {
          navigate(role === "admin" ? "/admin/viewtable" : "/user/index");
        });
      }, 1000);
    } catch (err) {
      console.error("❌ Login failed:", err.response?.data || err.message);

      if (err.response?.status === 429) {
        Swal.fire(
          "⛔ ถูกแบนถาวร",
          err.response.data?.message ||
            "คุณถูกแบนเนื่องจากพยายามเข้าสู่ระบบผิดพลาดหลายครั้ง กรุณาติดต่อผู้ดูแลระบบ",
          "error"
        );
      } else {
        Swal.fire(
          "ผิดพลาด",
          err.response?.data?.error === "Failed reCAPTCHA verification"
            ? "reCAPTCHA หมดอายุ หรือซ้ำ กรุณาติ๊กใหม่"
            : "ชื่อผู้ใช้ / รหัสผ่าน ไม่ถูกต้อง",
          "error"
        );
      }
    } finally {
      if (recaptchaRef.current) recaptchaRef.current.reset();
      setRecaptchaToken("");
    }
  };

  return (
    <>
      <CssBaseline />
      {/* Background */}
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

      {/* Login Form */}
      <Box
        minHeight="100vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
        sx={{
          position: "relative",
          zIndex: 2,
          px: 2,
        }}
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
              เข้าสู่ระบบ
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
                  placeholder="Enter username"
                  variant="outlined"
                  fullWidth
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
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  variant="outlined"
                  fullWidth
                  InputProps={{
                    sx: {
                      borderRadius: "12px",
                      backgroundColor: "rgba(255,255,255,0.07)",
                      color: "#fff",
                    },
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleTogglePassword}
                          edge="end"
                          sx={{ color: "#ccc" }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </FormControl>

              {/* reCAPTCHA */}
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
                เข้าสู่ระบบ
              </Button>

              <Stack alignItems="center" mt={3}>
                <Typography variant="body2" color="#ddd">
                  ยังไม่มีบัญชี?{" "}
                  <Link
                    to="/register"
                    style={{
                      color: "#c084fc",
                      fontWeight: "bold",
                      textDecoration: "none",
                    }}
                  >
                    สมัครสมาชิก
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

export default Login;
