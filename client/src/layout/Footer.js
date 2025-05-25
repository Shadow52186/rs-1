import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Stack,
  Grid,
  Divider,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebook,
  faInstagram,
  faDiscord,
} from "@fortawesome/free-brands-svg-icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Footer = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (!document.getElementById("facebook-jssdk")) {
      const script = document.createElement("script");
      script.id = "facebook-jssdk";
      script.src =
        "https://connect.facebook.net/th_TH/sdk.js#xfbml=1&version=v22.0";
      script.async = true;
      script.defer = true;
      script.crossOrigin = "anonymous";
      document.body.appendChild(script);
    }

    const timer = setTimeout(() => {
      if (window.FB) window.FB.XFBML.parse();
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API}/categories`);
        setCategories(res.data);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    fetchCategories();
  }, []);

  const handleNavigateAndReload = (path) => {
    navigate(path);
    window.location.reload();
  };

  return (
    <Box
      component="footer"
      sx={{
        mt: 10,
        px: { xs: 2, md: 6 },
        py: 8,
        background: "rgba(30, 30, 50, 0.9)",
        borderTop: "2px solid rgba(168,85,247,0.4)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 0 60px rgba(168,85,247,0.2)",
        fontFamily: "Prompt, sans-serif",
        color: "#fff",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Glow */}
      <Box
        sx={{
          position: "absolute",
          top: -100,
          left: "50%",
          width: 600,
          height: 600,
          background:
            "radial-gradient(circle, rgba(168,85,247,0.15), transparent 70%)",
          transform: "translateX(-50%)",
          zIndex: 0,
        }}
      />

      <Box
        sx={{ position: "relative", zIndex: 2, maxWidth: "1200px", mx: "auto" }}
      >
        <Typography
          variant="h4"
          fontWeight="bold"
          align="center"
          sx={{ textShadow: "0 0 15px #a855f7", mb: 1 }}
        >
          RS-SHOP
        </Typography>
        <Typography
          variant="body1"
          align="center"
          sx={{ color: "#ccc", mb: 6 }}
        >
          ไอดีเกมแท้ | ปลอดภัย | ได้รับทันที | Support ตลอด 24 ชั่วโมง
        </Typography>

        <Grid
          container
          spacing={4}
          justifyContent="space-between"
          sx={{ mb: 6 }}
        >
          {/* เกี่ยวกับเรา */}
          <Grid
            item
            xs={12}
            md={3}
            sx={{
              justifyContent: { xs: "center", md: "flex-start" },
              display: "flex",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: { xs: "center", md: "flex-start" },
                textAlign: { xs: "center", md: "left" },
              }}
            >
              <Typography variant="h6" sx={{ mb: 2 }}>
                เกี่ยวกับเรา
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "#aaa",
                  whiteSpace: "pre-line",
                  wordBreak: "break-word",
                }}
              >
                RS-SHOP คือเว็บไซต์จำหน่ายไอดีเกมแท้{"\n"}มีระบบอัตโนมัติ
                พร้อมแอดมินดูแลคุณตลอด 24 ชั่วโมง
              </Typography>
            </Box>
          </Grid>

          {/* หมวดหมู่ */}
          <Grid item xs={12} md={3}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              หมวดหมู่
            </Typography>
            {categories.map((cat) => (
              <Box
                key={cat._id}
                onClick={() => {
                  navigate(`/category/${cat._id}`);
                  window.location.reload();
                }}
                sx={{
                  display: "block",
                  color: "#aaa",
                  mb: 1,
                  cursor: "pointer",
                  textDecoration: "none",
                  fontFamily: "Prompt, sans-serif",
                  "&:hover": { color: "#fff" },
                }}
              >
                {cat.name}
              </Box>
            ))}
          </Grid>

          {/* ความช่วยเหลือ */}
          <Grid item xs={12} md={3}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              ความช่วยเหลือ
            </Typography>
            {[
              { label: "หน้าแรก", to: "/user/index" },
              { label: "สินค้า", to: "/products" },
              { label: "เติมเงิน", to: "/topup" },
              { label: "ประวัติการเติมเงิน", to: "/topup/history" },
              { label: "ประวัติซื้อสินค้า", to: "/user/history" },
              { label: "โปรไฟล์", to: "/user/profile" },
              { label: "จัดการหลังบ้าน", to: "/admin/viewtable" },
              { label: "เข้าสู่ระบบ", to: "/login" },
            ].map((item) => (
              <Box
                key={item.to}
                onClick={() => handleNavigateAndReload(item.to)}
                sx={{
                  display: "block",
                  color: "#aaa",
                  mb: 1,
                  cursor: "pointer",
                  fontFamily: "Prompt, sans-serif",
                  textDecoration: "none",
                  "&:hover": { color: "#fff" },
                }}
              >
                {item.label}
              </Box>
            ))}
          </Grid>

          <Grid
            item
            xs={12}
            md={3}
            sx={{
              display: "flex",
              justifyContent: { xs: "center", md: "flex-start" },
            }}
          >
            
          </Grid>

          
        </Grid>
       <Box
  sx={{
    textAlign: "center",
    mt: { xs: 4, md: 6 },  // ✅ เว้นด้านบน
    mb: { xs: 5, md: 8 },  // ✅ เว้นด้านล่าง
  }}
>
  <Typography variant="h6" sx={{ mb: 2 }}>
    ติดตามเรา
  </Typography>
  <Stack direction="row" spacing={3} justifyContent="center">
    <IconButton
      component="a"
      href="https://www.facebook.com/profile.php?id=100075513804603"
      target="_blank"
      sx={{
        color: "#60a5fa",
        fontSize: "2rem",
        "&:hover": {
          color: "#93c5fd",
          transform: "scale(1.2)",
          textShadow: "0 0 10px #93c5fd",
        },
      }}
    >
      <FontAwesomeIcon icon={faFacebook} />
    </IconButton>

    <IconButton
      component="a"
      href="https://www.instagram.com/quax.tix/"
      target="_blank"
      sx={{
        color: "#fb7185",
        fontSize: "2rem",
        "&:hover": {
          color: "#f472b6",
          transform: "scale(1.2)",
          textShadow: "0 0 10px #f472b6",
        },
      }}
    >
      <FontAwesomeIcon icon={faInstagram} />
    </IconButton>

    <IconButton
      component="a"
      href="https://discord.gg/yourinvite"
      target="_blank"
      sx={{
        color: "#a78bfa",
        fontSize: "2rem",
        "&:hover": {
          color: "#c084fc",
          transform: "scale(1.2)",
          textShadow: "0 0 10px #c084fc",
        },
      }}
    >
      <FontAwesomeIcon icon={faDiscord} />
    </IconButton>
  </Stack>
</Box>


        {/* Facebook Embed */}
        <Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>
          เพจของเรา
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            py: 4,
            px: 2,
          }}
        >
          <Box
            sx={{
              width: "100%",
              maxWidth: "100%",
              overflowX: "auto",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div
              className="fb-page"
              data-href="https://www.facebook.com/profile.php?id=100075513804603"
              data-tabs="timeline"
              data-width="1000"
              data-height="500"
              data-small-header="false"
              data-adapt-container-width="false"
              data-hide-cover="false"
              data-show-facepile="false"
            >
              <blockquote
                cite="https://www.facebook.com/profile.php?id=100075513804603"
                className="fb-xfbml-parse-ignore"
              >
                <a href="https://www.facebook.com/profile.php?id=100075513804603">
                  Facebook Page
                </a>
              </blockquote>
            </div>
          </Box>
        </Box>

        <Divider
          sx={{
            borderColor: "rgba(255,255,255,0.1)",
            maxWidth: 1000,
            mx: "auto",
            my: 6,
          }}
        />
        <Typography variant="body2" align="center" sx={{ color: "#aaa" }}>
          © {new Date().getFullYear()} RS-SHOP — Powered by{" "}
          <strong style={{ color: "#a855f7" }}>rotisaimai</strong>
        </Typography>
      </Box>
    </Box>
  );
};

export default Footer;
