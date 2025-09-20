import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Box, Typography, Grid, Button, CircularProgress } from "@mui/material";
import { motion } from "framer-motion";
import Particles from "../../../components/effects/Particles";
import Threads from "../../../components/effects/Threads";



const api = axios.create({
  timeout: 5000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
});

// Cache for API responses
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Optimized fetch with caching and retry logic
const fetchWithCache = async (url, retries = 2) => {
  const cacheKey = url;
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  for (let i = 0; i <= retries; i++) {
    try {
      const response = await api.get(url);
      cache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      });
      return response.data;
    } catch (error) {
      if (i === retries) {
        if (cached) return cached.data;
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};

// Skeleton loader component with better design
const SkeletonLoader = React.memo(() => (
  <Box sx={{ position: "relative", minHeight: "100vh", overflowX: "hidden" }}>
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
    
    <Box sx={{ px: { xs: 2, sm: 4, md: 6 }, py: 10, position: "relative", zIndex: 2 }}>
      {/* Header skeleton */}
      <Box
        sx={{
          width: "300px",
          height: 40,
          background: "linear-gradient(90deg, #333 25%, #555 37%, #333 63%)",
          backgroundSize: "400% 100%",
          animation: "shimmer 1.5s ease-in-out infinite",
          borderRadius: "8px",
          mb: 6,
          mx: "auto",
          "@keyframes shimmer": {
            "0%": { backgroundPosition: "100% 0" },
            "100%": { backgroundPosition: "-100% 0" }
          }
        }}
      />
      
      {/* Loading spinner */}
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <CircularProgress size={50} sx={{ color: "#a855f7" }} />
        <Typography sx={{ color: "#fff", mt: 2 }}>กำลังโหลดสินค้า...</Typography>
      </Box>
      
      {/* Container skeleton */}
      <Box
        sx={{
          background: "rgba(255, 255, 255, 0.05)",
          borderRadius: "20px",
          padding: 5,
          minHeight: "60vh",
          maxWidth: "1500px",
          mx: "auto",
        }}
      >
        <Grid container spacing={4} justifyContent="center">
          {[...Array(8)].map((_, i) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
              <Box
                sx={{
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "24px",
                  overflow: "hidden",
                  height: "400px",
                }}
              >
                <Box
                  sx={{
                    width: "100%",
                    height: "230px",
                    background: "linear-gradient(90deg, #333 25%, #555 37%, #333 63%)",
                    backgroundSize: "400% 100%",
                    animation: "shimmer 1.5s ease-in-out infinite",
                  }}
                />
                <Box sx={{ p: 2 }}>
                  {[1, 2, 3].map((j) => (
                    <Box
                      key={j}
                      sx={{
                        width: `${100 - j * 15}%`,
                        height: 20,
                        background: "linear-gradient(90deg, #333 25%, #555 37%, #333 63%)",
                        backgroundSize: "400% 100%",
                        animation: "shimmer 1.5s ease-in-out infinite",
                        borderRadius: "4px",
                        mb: 1,
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  </Box>
));

// Memoized background component with reduced particles
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
    <Particles
      particleCount={120} // Further reduced for better performance
      particleColors={["#ffffff", "#bbf7ff", "#c084fc"]}
      particleBaseSize={60}
      moveParticlesOnHover
      particleHoverFactor={1.2}
      alphaParticles
    />
    <Threads
      color={[0.6, 0.3, 1]}
      amplitude={0.6}
      distance={0.0}
      enableMouseInteraction
    />
  </Box>
));

// Memoized product card component with improved image loading
const ProductCard = React.memo(({ product, stock, index, onViewProduct }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
    setImageError(false);
  }, []);

  const handleImageError = useCallback((e) => {
    console.warn(`Failed to load image: ${product.image}`);
    setImageError(true);
    setImageLoaded(true); // Hide loading spinner even on error
  }, [product.image]);

  const stockStatus = useMemo(() => {
    if (stock === 0) return { text: "❌ หมด", color: "#ef4444" };
    if (stock <= 5) return { text: `⚠️ เหลือน้อย: ${stock}`, color: "#f97316" };
    return { text: `✅ คงเหลือ: ${stock}`, color: "#10b981" };
  }, [stock]);

  return (
    <Grid item xs={12} sm={6} md={4} lg={3}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.5) }} // Limited delay
        viewport={{ once: true, margin: "-50px" }}
        style={{
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(8px)",
          borderRadius: "24px",
          overflow: "hidden",
          boxShadow: "0 8px 24px rgba(147, 51, 234, 0.3)",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          transform: "translateZ(0)",
        }}
      >
        <Box sx={{ position: "relative" }}>
          {/* Loading placeholder - always show until image loads */}
          {!imageLoaded && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "230px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderTopLeftRadius: "24px",
                borderTopRightRadius: "24px",
                zIndex: 1,
              }}
            >
              <CircularProgress size={30} sx={{ color: "#a855f7" }} />
            </Box>
          )}
          
          {/* Error placeholder */}
          {imageError && (
            <Box
              sx={{
                width: "100%",
                height: "230px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderTopLeftRadius: "24px",
                borderTopRightRadius: "24px",
                color: "#bbb",
              }}
            >
              <Typography sx={{ fontSize: "40px", mb: 1 }}>📷</Typography>
              <Typography sx={{ fontSize: "12px" }}>ไม่สามารถโหลดรูปได้</Typography>
            </Box>
          )}
          
          {/* Actual image - always render but control visibility */}
          {!imageError && (
            <Box
              component="img"
              src={product.image}
              alt={product.name}
              loading="eager" // Changed from lazy to eager for better loading
              decoding="async"
              onLoad={handleImageLoad}
              onError={handleImageError}
              sx={{
                width: "100%",
                height: "230px",
                objectFit: "cover",
                display: "block",
                borderTopLeftRadius: "24px",
                borderTopRightRadius: "24px",
                transform: "translateZ(0)",
                opacity: imageLoaded ? 1 : 0,
                transition: "opacity 0.3s ease-in-out",
              }}
            />
          )}
          
          {/* Product status tag */}
          {product.status && (
            <Box
              sx={{
                position: "absolute",
                top: 12,
                left: 12,
                backgroundColor: "#9333ea",
                color: "#fff",
                px: 1.5,
                py: 0.5,
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: "bold",
                textShadow: "0 0 4px black",
              }}
            >
              {product.status}
            </Box>
          )}
        </Box>

        <Box sx={{ px: 2, py: 2, flexGrow: 1 }}>
          <Typography
            fontWeight="bold"
            fontSize="18px"
            sx={{ 
              color: "#fff", 
              mb: 1,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {product.name}
          </Typography>

          <Typography 
            fontSize="14px" 
            sx={{ 
              color: "#bbb", 
              mb: 1,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            📝 {product.detail?.slice(0, 60) || "ไม่มีรายละเอียด"}...
          </Typography>

          <Typography
            fontSize="16px"
            fontWeight="bold"
            sx={{ color: "#4ade80", mb: 1 }}
          >
            💰 {product.price} POINT
          </Typography>

          <Typography 
            fontSize="14px" 
            sx={{ color: stockStatus.color, mb: 2 }}
          >
            {stockStatus.text}
          </Typography>

          <Button
            onClick={() => onViewProduct(product._id)}
            fullWidth
            disabled={stock === 0}
            sx={{
              background: stock === 0 
                ? "rgba(255, 255, 255, 0.1)" 
                : "linear-gradient(90deg, #6366f1, #a855f7)",
              color: stock === 0 ? "#888" : "#fff",
              fontWeight: 700,
              fontSize: "15px",
              borderRadius: "999px",
              textTransform: "none",
              boxShadow: stock === 0 ? "none" : "0 0 12px rgba(147,51,234,0.4)",
              py: 1.2,
              transition: "0.2s",
              "&:hover": stock === 0 ? {} : {
                background: "linear-gradient(90deg, #7c3aed, #4f46e5)",
                boxShadow: "0 0 20px rgba(147,51,234,0.7)",
                transform: "scale(1.03)",
              },
            }}
          >
            {stock === 0 ? "🚫 สินค้าหมด" : "👁️ ดูเพิ่มเติม"}
          </Button>
        </Box>
      </motion.div>
    </Grid>
  );
});

// Error component
const ErrorComponent = React.memo(({ error, categoryName }) => (
  <Box sx={{ position: "relative", minHeight: "100vh", overflowX: "hidden" }}>
    <BackgroundEffects />
    <Box sx={{ px: { xs: 2, sm: 4, md: 6 }, py: 10, position: "relative", zIndex: 2 }}>
      <Typography
        variant="h4"
        fontWeight="bold"
        align="center"
        sx={{
          color: "#fff",
          mb: 4,
          textShadow: "0 0 10px #a855f7, 0 0 20px #9333ea",
        }}
      >
        📁 หมวดหมู่: {categoryName || "ไม่พบ"}
      </Typography>
      
      <Box
        sx={{
          background: "rgba(255, 255, 255, 0.05)",
          borderRadius: "20px",
          padding: 5,
          textAlign: "center",
          maxWidth: "600px",
          mx: "auto",
        }}
      >
        <Typography
          variant="h6"
          sx={{ color: "#ff6b6b", mb: 2 }}
        >
          เกิดข้อผิดพลาด
        </Typography>
        <Typography sx={{ color: "#fff" }}>
          {error}
        </Typography>
      </Box>
    </Box>
  </Box>
));

const CategoryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [stockMap, setStockMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [id]);

  useEffect(() => {
    const controller = new AbortController();
    
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const baseURL = process.env.REACT_APP_API;
        
        // Fetch category and products in parallel
        const [categoryData, productsData] = await Promise.allSettled([
          fetchWithCache(`${baseURL}/categories/${id}`),
          fetchWithCache(`${baseURL}/product?categoryId=${id}`)
        ]);

        if (categoryData.status === 'fulfilled') {
          setCategoryName(categoryData.value?.name || "");
        } else {
          console.warn('Failed to fetch category name');
        }

        if (productsData.status === 'fulfilled') {
          const products = productsData.value || [];
          setProducts(products);

          // Preload images for better UX
          products.forEach((product) => {
            if (product.image) {
              const img = new Image();
              img.src = product.image;
            }
          });

          // Fetch stock data in smaller batches for better performance
          const batchSize = 5; // Reduced batch size
          const stockCounts = {};
          
          for (let i = 0; i < products.length; i += batchSize) {
            const batch = products.slice(i, i + batchSize);
            const stockPromises = batch.map(async (product) => {
              try {
                const stockData = await fetchWithCache(`${baseURL}/stock/${product._id}`);
                const stocks = stockData || [];
                const available = stocks.filter((s) => !s.isSold);
                return { productId: product._id, stock: available.length };
              } catch {
                return { productId: product._id, stock: 0 };
              }
            });

            const batchResults = await Promise.allSettled(stockPromises);
            batchResults.forEach((result) => {
              if (result.status === 'fulfilled') {
                stockCounts[result.value.productId] = result.value.stock;
              }
            });
            
            // Small delay between batches to prevent overwhelming the server
            if (i + batchSize < products.length) {
              await new Promise(resolve => setTimeout(resolve, 50));
            }
          }
          setStockMap(stockCounts);
        } else {
          throw new Error('ไม่สามารถโหลดสินค้าได้');
        }

      } catch (err) {
        console.error("❌ Failed to load category page", err);
        setError(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
    
    return () => controller.abort();
  }, [id]);

  const handleViewProduct = useCallback((productId) => {
    navigate(`/product/${productId}`);
  }, [navigate]);

  // Show skeleton loader while loading
  if (isLoading) {
    return <SkeletonLoader />;
  }

  // Show error component if there's an error
  if (error) {
    return <ErrorComponent error={error} categoryName={categoryName} />;
  }

  return (
    <Box sx={{ position: "relative", minHeight: "100vh", overflowX: "hidden" }}>
      <BackgroundEffects />

      <Box
        sx={{
          px: { xs: 2, sm: 4, md: 6 },
          py: 10,
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
          📁 หมวดหมู่: {categoryName}
        </Typography>

        <Box
          sx={{
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "20px",
            padding: 5,
            boxShadow: "0 0 50px rgba(147, 51, 234, 0.2)",
            minHeight: "60vh",
            width: "100%",
            maxWidth: "1500px",
            mx: "auto",
          }}
        >
          {products.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Typography
                variant="h6"
                sx={{ color: "#fff", mb: 2 }}
              >
                📦 ไม่พบสินค้าในหมวดหมู่นี้
              </Typography>
              <Typography sx={{ color: "#bbb" }}>
                ลองเลือกหมวดหมู่อื่น หรือกลับไปดูสินค้าทั้งหมด
              </Typography>
            </Box>
          ) : (
            <>
              <Typography
                sx={{ 
                  color: "#bbb", 
                  textAlign: "center", 
                  mb: 4,
                  fontSize: "14px"
                }}
              >
                พบสินค้า {products.length} รายการ
              </Typography>
              
              <Grid container spacing={4} justifyContent="center">
                {products.map((product, index) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    stock={stockMap[product._id] ?? 0}
                    index={index}
                    onViewProduct={handleViewProduct}
                  />
                ))}
              </Grid>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default CategoryPage;