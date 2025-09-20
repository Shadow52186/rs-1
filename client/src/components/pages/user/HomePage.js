import { useNavigate } from "react-router-dom";
import React, { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { Box, Typography, Button, Grid } from "@mui/material";
import CountUp from "react-countup";
import axios from "axios";
import Threads from "../../../components/effects/Threads";
import Particles from "../../../components/effects/Particles";
import BlurText from "../../../components/effects/BlurText";
import TiltedCard from "../../../components/effects/TiltedCard";
import { motion } from "framer-motion";


const api = axios.create({
  timeout: 3000, 
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
});

// Cache for API responses
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; 

// Optimized fetch with caching
const fetchWithCache = async (url) => {
  const cacheKey = url;
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const response = await api.get(url);
    cache.set(cacheKey, {
      data: response.data,
      timestamp: Date.now()
    });
    return response.data;
  } catch (error) {
    // Return cached data if available, even if expired
    if (cached) return cached.data;
    throw error;
  }
};

// Skeleton loader component
const SkeletonLoader = React.memo(() => (
  <Box sx={{ position: "relative", width: "100%", overflowX: "hidden" }}>
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)",
        zIndex: 0,
      }}
    />
    <Box sx={{ px: 2, py: 10, position: "relative", zIndex: 2 }}>
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
          minHeight: "100vh",
        }}
      >
        <Box sx={{ maxWidth: 600, textAlign: { xs: "center", md: "left" } }}>
          <Box
            sx={{
              width: 200,
              height: 100,
              background: "linear-gradient(90deg, #333 25%, transparent 37%, #333 63%)",
              backgroundSize: "400% 100%",
              animation: "shimmer 1.5s ease-in-out infinite",
              borderRadius: "10px",
              mb: 4,
              mx: { xs: "auto", md: 0 },
              "@keyframes shimmer": {
                "0%": { backgroundPosition: "100% 0" },
                "100%": { backgroundPosition: "-100% 0" }
              }
            }}
          />
          {[1, 2, 3].map((i) => (
            <Box
              key={i}
              sx={{
                width: `${100 - i * 10}%`,
                height: 40,
                background: "linear-gradient(90deg, #333 25%, transparent 37%, #333 63%)",
                backgroundSize: "400% 100%",
                animation: "shimmer 1.5s ease-in-out infinite",
                borderRadius: "8px",
                mb: 2,
                mx: { xs: "auto", md: 0 },
              }}
            />
          ))}
        </Box>
        <Box sx={{ width: { xs: "100%", md: "50%" } }}>
          <Box
            sx={{
              width: "100%",
              height: 400,
              background: "linear-gradient(90deg, #333 25%, transparent 37%, #333 63%)",
              backgroundSize: "400% 100%",
              animation: "shimmer 1.5s ease-in-out infinite",
              borderRadius: "20px",
            }}
          />
        </Box>
      </Box>
    </Box>
  </Box>
));

// Optimized API hook with aggressive caching and reduced loading time
const useAPIData = () => {
  const [data, setData] = useState({
    categories: [],
    stats: [
      { label: "ผู้ใช้งาน", value: 0, suffix: "" },
      { label: "ยอดขายสำเร็จ", value: 0, suffix: "" },
      { label: "สินค้าในระบบ", value: 0, suffix: "" },
    ],
    featuredProducts: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    
    const fetchAllData = async () => {
      try {
        const baseURL = process.env.REACT_APP_API;
        
        // Start all requests immediately
        const requests = [
          fetchWithCache(`${baseURL}/categories`),
          fetchWithCache(`${baseURL}/stats`),
          fetchWithCache(`${baseURL}/product/featured`)
        ];

        // Use Promise.allSettled for better error handling
        const results = await Promise.allSettled(requests);
        
        const newData = { ...data };
        
        // Process categories
        if (results[0].status === 'fulfilled') {
          newData.categories = results[0].value || [];
        }
        
        // Process stats
        if (results[1].status === 'fulfilled') {
          const statsData = results[1].value;
          newData.stats = [
            { label: "ผู้ใช้งาน", value: statsData?.users || 0, suffix: "" },
            { label: "ยอดขายสำเร็จ", value: statsData?.sold || 0, suffix: "" },
            { label: "สินค้าในระบบ", value: statsData?.products || 0, suffix: "" },
          ];
        }
        
        // Process featured products
        if (results[2].status === 'fulfilled') {
          newData.featuredProducts = results[2].value || [];
        }
        
        setData(newData);
        
        // Minimal loading time for better UX
        setTimeout(() => setIsLoading(false), 100);
        
      } catch (error) {
        console.error("API Error:", error);
        // Still show content even if some requests fail
        setIsLoading(false);
      }
    };

    fetchAllData();
    
    return () => controller.abort();
  }, []);

  return { ...data, isLoading };
};

// Memoized and optimized background component
const BackgroundEffects = React.memo(() => (
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
        particleCount={150} // Reduced from 300
        particleColors={["#ffffff", "#bbf7ff", "#c084fc"]}
        particleBaseSize={60} // Reduced from 80
        moveParticlesOnHover
        particleHoverFactor={1.3} // Reduced from 1.5
        alphaParticles
      />
    </Box>
    <Box sx={{ position: "absolute", inset: 0, zIndex: 1 }}>
      <Threads
        color={[0.6, 0.3, 1]}
        amplitude={0.6} // Reduced from 0.8
        distance={0.0}
        enableMouseInteraction
      />
    </Box>
  </Box>
));

// Optimized product card with lazy loading
const ProductCard = React.memo(({ product, onProductClick }) => (
  <Grid item xs={12} sm={6} md={4} lg={3}>
    <motion.div
      initial={{ opacity: 0, y: 20 }} // Reduced from y: 40
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }} // Reduced from 0.5
      viewport={{ once: true, margin: "-50px" }} // Start animation earlier
    >
      <Box
        onClick={() => onProductClick(product._id)}
        sx={{
          background: "rgba(17,17,17, 0.7)",
          backdropFilter: "blur(8px)", 
          WebkitBackdropFilter: "blur(8px)",
          borderRadius: "20px",
          border: "1px solid rgba(255,255,255,0.05)",
          boxShadow: "0 0 20px rgba(168,85,247,0.2)", 
          overflow: "hidden",
          transition: "0.2s", // Reduced from 0.3s
          display: "flex",
          flexDirection: "column",
          height: "100%",
          cursor: "pointer",
          transform: "translateZ(0)", // Force GPU acceleration
          "&:hover": {
            transform: "scale(1.02) translateZ(0)",
            boxShadow: "0 0 30px rgba(168,85,247,0.4)",
          },
        }}
      >
        <Box
          sx={{
            height: "350px",
            width: "350px",
            overflow: "hidden",
          }}
        >
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            decoding="async"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: "translateZ(0)",
            }}
          />
        </Box>

        <Box sx={{ p: 2 }}>
          <Typography
            sx={{
              color: "#fff",
              fontWeight: "bold",
              fontSize: "16px",
              mb: 0.5,
              overflow: "hidden",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
            }}
          >
            {product.name}
          </Typography>

          <Typography
            sx={{
              color: "#ccc",
              fontSize: "14px",
              mb: 1,
              overflow: "hidden",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
            }}
          >
            {product.detail?.slice(0, 30)}...
          </Typography>

          <Typography
            sx={{
              color: "#00ffc3",
              fontWeight: "bold",
              fontSize: "14px",
            }}
          >
            💰 ราคา {product.price} บาท
          </Typography>
        </Box>
      </Box>
    </motion.div>
  </Grid>
));

// Optimized category card
const CategoryCard = React.memo(({ category, onCategoryClick }) => (
  <Grid item xs={12} sm={6}>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      viewport={{ once: true, margin: "-50px" }}
    >
      <Box
        onClick={() => onCategoryClick(category._id)}
        sx={{
          backgroundColor: "#1f1f1f",
          borderRadius: "20px",
          boxShadow: "0 0 20px rgba(168,85,247,0.2)",
          overflow: "hidden",
          cursor: "pointer",
          transition: "0.2s",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          transform: "translateZ(0)",
          "&:hover": {
            transform: "scale(1.02) translateZ(0)",
            boxShadow: "0 0 30px rgba(168,85,247,0.4)",
          },
        }}
      >
        <img
          src={category.image}
          alt={category.name}
          loading="lazy"
          decoding="async"
          style={{
            width: "100%",
            height: "auto",
            maxWidth: "550px",
            maxHeight: "350px",
            objectFit: "cover",
            borderTopLeftRadius: "20px",
            borderTopRightRadius: "20px",
            transform: "translateZ(0)",
          }}
        />
      </Box>
    </motion.div>
  </Grid>
));

const HomePage = () => {
  const { categories, stats, featuredProducts, isLoading } = useAPIData();
  const categoryRef = useRef(null);
  const navigate = useNavigate();

  // Optimized navigation handlers
  const scrollToCategories = useCallback(() => {
    categoryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleProductClick = useCallback((productId) => {
    navigate(`/product/${productId}`);
    // Use requestAnimationFrame for smoother scrolling
  }, [navigate]);

  const handleCategoryClick = useCallback((categoryId) => {
    navigate(`/category/${categoryId}`);
  }, [navigate]);

  const handleNavigateToProducts = useCallback(() => {
    navigate("/products");
  }, [navigate]);

  const handleLogoClick = useCallback(() => {
    navigate("/");
  }, [navigate]);

  // Optimized responsive dimensions
  const containerHeight = useMemo(() => 
    window.innerWidth < 600 ? "500px" : "600px", []
  );

  // Show skeleton loader instead of black screen
  if (isLoading) {
    return <SkeletonLoader />;
  }

  return (
    <Box sx={{ position: "relative", width: "100%", overflowX: "hidden" }}>
      <BackgroundEffects />

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
            <Box
              sx={{
                display: "flex",
                justifyContent: { xs: "center", md: "flex-start" },
                mb: -2,
              }}
            >
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
                onClick={handleLogoClick}
                loading="eager" 
              />
            </Box>

            <BlurText
              text="RS-Shop"
              delay={50} // Reduced from 80
              animateBy="letters"
              direction="top"
              stepDuration={0.2} // Reduced from 0.4
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
              delay={60} // Reduced from 100
              animateBy="words"
              direction="top"
              stepDuration={0.2} // Reduced from 0.4
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
              delay={40} // Reduced from 60
              animateBy="words"
              direction="top"
              stepDuration={0.15} // Reduced from 0.35
              style={{
                fontSize: "clamp(14px, 3vw, 18px)",
                color: "#fff",
                marginBottom: "24px",
                textShadow: `0 0 10px #a855f7, 0 0 20px #9333ea, 0 0 40px #6366f1`,
                textTransform: "uppercase",
              }}
            />
            <Button
              onClick={handleNavigateToProducts}
              sx={{
                background: "linear-gradient(90deg, #a855f7, #6366f1)",
                color: "#fff",
                px: 5,
                py: 1.8,
                fontSize: "16px",
                borderRadius: "50px",
                boxShadow: "0 0 25px rgba(168,85,247,0.5)",
                textTransform: "none",
                transition: "0.2s", // Reduced from 0.3s
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
                      duration={1.5} // Reduced from 2.5
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
                containerHeight={containerHeight}
                imageWidth="100%"
                imageHeight="100%"
                scaleOnHover={1.1} // Reduced from 1.2
                rotateAmplitude={10} // Reduced from 15
                showTooltip={true}
                showMobileWarning={false}
                displayOverlayContent={true}
                imageStyle={{
                  borderRadius: "20px",
                  transition: "0.3s", // Reduced from 0.4s
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
                      textShadow:
                        "0 0 15px rgba(61, 61, 61, 0.9), 0 0 25px #a855f7",
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

        {/* Featured Products */}
        <Box
          sx={{
            width: "100%",
            maxWidth: "1300px",
            mx: "auto",
            px: 2,
            pt: 8,
            zIndex: 300,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              color: "#fff",
              textAlign: "center",
              mb: 6,
              fontWeight: "bold",
              textShadow: "0 0 15px #a855f7, 0 0 25px #9333ea",
              fontSize: "28px",
            }}
          >
            ⭐ สินค้าแนะนำ
          </Typography>

          <Grid
            container
            spacing={4}
            justifyContent="center"
            alignItems="stretch"
          >
            {featuredProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onProductClick={handleProductClick}
              />
            ))}
          </Grid>
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
              <CategoryCard
                key={cat._id}
                category={cat}
                onCategoryClick={handleCategoryClick}
              />
            ))}
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default HomePage;