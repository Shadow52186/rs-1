import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Box,
  Grid,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Particles from "../../../components/effects/Particles";
import Threads from "../../../components/effects/Threads";

// Create axios instance with optimized settings
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

// Custom Hook for data fetching with error handling and retry logic
const useProductData = () => {
  const [products, setProducts] = useState([]);
  const [stockMap, setStockMap] = useState({});
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStockForProduct = useCallback(async (productId) => {
    try {
      const stocks = await fetchWithCache(`${process.env.REACT_APP_API}/stock/${productId}`);
      return stocks ? stocks.filter(s => !s.isSold).length : 0;
    } catch {
      return 0;
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch products and categories in parallel
        const [productsData, categoriesData] = await Promise.allSettled([
          fetchWithCache(`${process.env.REACT_APP_API}/product`),
          fetchWithCache(`${process.env.REACT_APP_API}/categories`)
        ]);

        if (productsData.status === 'fulfilled') {
          setProducts(productsData.value);
          
          // Fetch stock data for all products in batches to avoid overwhelming the server
          const batchSize = 5;
          const stockCounts = {};
          
          for (let i = 0; i < productsData.value.length; i += batchSize) {
            const batch = productsData.value.slice(i, i + batchSize);
            const stockPromises = batch.map(async (product) => {
              const stock = await fetchStockForProduct(product._id);
              return { productId: product._id, stock };
            });

            const batchResults = await Promise.allSettled(stockPromises);
            batchResults.forEach((result) => {
              if (result.status === 'fulfilled') {
                stockCounts[result.value.productId] = result.value.stock;
              }
            });
            
            // Small delay between batches
            if (i + batchSize < productsData.value.length) {
              await new Promise(resolve => setTimeout(resolve, 50));
            }
          }
          setStockMap(stockCounts);
        } else {
          throw new Error('Failed to fetch products');
        }

        if (categoriesData.status === 'fulfilled') {
          setCategories(categoriesData.value);
        } else {
          console.warn('Failed to fetch categories');
          setCategories([]);
        }

      } catch (err) {
        console.error("โหลดสินค้าหรือหมวดหมู่ล้มเหลว:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchStockForProduct]);

  return { products, stockMap, categories, loading, error };
};

// Memoized Background Component
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
      particleCount={120} // Reduced for better performance
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

// Memoized Product Card Component with lazy loading
const ProductCard = React.memo(({ product, stock, index, onViewProduct }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const tag = product.status || "";

  const getTagColor = useMemo(() => {
    if (tag.includes("ขายดี")) return "#ef4444";
    if (tag.includes("อัปเดต")) return "#f97316";
    if (tag.includes("เวอร์ชัน")) return "#3b82f6";
    return "#9333ea";
  }, [tag]);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
    setImageError(false);
  }, []);

  const handleImageError = useCallback(() => {
    console.warn(`Failed to load image: ${product.image}`);
    setImageError(true);
    setImageLoaded(true);
  }, [product.image]);

  const stockStatus = useMemo(() => {
    if (stock === 0) return { text: "❌ หมด", color: "#ef4444" };
    if (stock <= 5) return { text: `⚠️ เหลือน้อย: ${stock}`, color: "#f97316" };
    return { text: `✅ คงเหลือ: ${stock}`, color: "#10b981" };
  }, [stock]);

  return (
    <Grid item xs={12} sm={6} md={4} lg={3}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.8) }}
        viewport={{ once: true }}
        style={{
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(8px)",
          borderRadius: "24px",
          overflow: "hidden",
          boxShadow: "0 8px 24px rgba(147, 51, 234, 0.3)",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box sx={{ position: "relative" }}>
          {/* Loading placeholder */}
          {!imageLoaded && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "300px",
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
                height: "300px",
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
          
          {/* Actual image */}
          {!imageError && (
            <Box
              component="img"
              src={product.image}
              alt={product.name}
              loading="eager"
              decoding="async"
              onLoad={handleImageLoad}
              onError={handleImageError}
              sx={{
                width: "100%",
                height: "300px",
                objectFit: "cover",
                display: "block",
                borderTopLeftRadius: "24px",
                borderTopRightRadius: "24px",
                opacity: imageLoaded ? 1 : 0,
                transition: "opacity 0.3s ease-in-out",
              }}
            />
          )}
          
          {tag && (
            <Box
              sx={{
                position: "absolute",
                top: 12,
                left: 12,
                backgroundColor: getTagColor,
                color: "#fff",
                px: 1.5,
                py: 0.5,
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: "bold",
                textShadow: "0 0 4px black",
              }}
            >
              {tag}
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
            {stock === 0 ? "🚫 สินค้าหมด" : "🚀 ซื้อเลย"}
          </Button>
        </Box>
      </motion.div>
    </Grid>
  );
});

// Memoized Filter Button Component
const FilterButton = React.memo(({ selectedCategory, categories, onMenuOpen }) => {
  const selectedCategoryName = useMemo(() => {
    if (selectedCategory === "all") return "📦 แสดงทั้งหมด";
    const category = categories.find((cat) => cat._id === selectedCategory);
    return `🗂 ${category?.name || ""}`;
  }, [selectedCategory, categories]);

  return (
    <IconButton
      onClick={onMenuOpen}
      sx={{
        px: 4,
        py: 1.5,
        borderRadius: "999px",
        fontWeight: "bold",
        fontSize: "16px",
        color: "#fff",
        background: "linear-gradient(90deg, #6366f1, #a855f7)",
        boxShadow: "0 0 20px rgba(168,85,247,0.4)",
        transition: "0.3s",
        "&:hover": {
          background: "linear-gradient(90deg, #7c3aed, #4f46e5)",
          boxShadow: "0 0 30px rgba(168,85,247,0.7)",
          transform: "scale(1.05)",
        },
      }}
    >
      <FilterListIcon sx={{ mr: 1 }} />
      <Typography fontWeight="bold" fontSize="16px">
        {selectedCategoryName}
      </Typography>
    </IconButton>
  );
});

// Memoized Search Input Component
const SearchInput = React.memo(({ searchTerm, onSearchChange }) => (
  <Box
    sx={{
      maxWidth: "600px",
      mx: "auto",
      mb: 5,
    }}
  >
    <input
      type="text"
      placeholder="🔍 ค้นหาสินค้า..."
      value={searchTerm}
      onChange={onSearchChange}
      style={{
        width: "100%",
        padding: "14px 20px",
        borderRadius: "12px",
        fontSize: "16px",
        border: "none",
        outline: "none",
        background: "rgba(255, 255, 255, 0.08)",
        color: "#fff",
        boxShadow: "0 0 12px rgba(168, 85, 247, 0.2)",
      }}
    />
  </Box>
));

// Loading Component
const LoadingComponent = React.memo(() => (
  <Box sx={{ position: "relative", minHeight: "100vh", overflowX: "hidden" }}>
    <BackgroundEffects />
    <Box 
      sx={{ 
        px: { xs: 2, sm: 4, md: 6 }, 
        py: 10, 
        position: "relative", 
        zIndex: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "50vh"
      }}
    >
      <CircularProgress size={60} sx={{ color: "#a855f7", mb: 3 }} />
      <Typography
        variant="h4"
        fontWeight="bold"
        align="center"
        sx={{
          color: "#fff",
          textShadow: "0 0 10px #a855f7, 0 0 20px #9333ea",
        }}
      >
        กำลังโหลด...
      </Typography>
    </Box>
  </Box>
));

// Error Component
const ErrorComponent = React.memo(({ error }) => (
  <Box sx={{ position: "relative", minHeight: "100vh", overflowX: "hidden" }}>
    <BackgroundEffects />
    <Box sx={{ px: { xs: 2, sm: 4, md: 6 }, py: 10, position: "relative", zIndex: 2 }}>
      <Typography
        variant="h4"
        fontWeight="bold"
        align="center"
        sx={{
          color: "#ff6b6b",
          textShadow: "0 0 10px #ff6b6b",
          mb: 2
        }}
      >
        เกิดข้อผิดพลาด
      </Typography>
      <Typography
        variant="h6"
        align="center"
        sx={{ color: "#fff" }}
      >
        {error}
      </Typography>
    </Box>
  </Box>
));

const AllProductsPage = () => {
  const { products, stockMap, categories, loading, error } = useProductData();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const open = Boolean(anchorEl);

  // ScrollToTop is now handled globally in App.js

  // Memoized event handlers
  const handleMenuOpen = useCallback((event) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleMenuClose = useCallback((categoryId) => {
    setAnchorEl(null);
    if (categoryId !== undefined) {
      setSelectedCategory(categoryId);
    }
  }, []);

  const handleViewProduct = useCallback((id) => {
    navigate(`/product/${id}`);
    // Remove window.location.reload() for better performance
  }, [navigate]);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  // Memoized filtered products with improved search
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCategory =
        selectedCategory === "all" || p.categoryId === selectedCategory;
      const matchSearch = searchTerm === "" || 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.detail && p.detail.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchCategory && matchSearch;
    });
  }, [products, selectedCategory, searchTerm]);

  // Early returns for loading and error states
  if (loading) {
    return <LoadingComponent />;
  }

  if (error) {
    return <ErrorComponent error={error} />;
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
            mb: 4,
            textShadow: "0 0 10px #a855f7, 0 0 20px #9333ea",
          }}
        >
          🛍️ สินค้าทั้งหมด
        </Typography>

        {/* Filter Button */}
        <Box textAlign="center" mb={3}>
          <FilterButton
            selectedCategory={selectedCategory}
            categories={categories}
            onMenuOpen={handleMenuOpen}
          />

          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={() => handleMenuClose()}
            PaperProps={{
              sx: {
                mt: 1,
                borderRadius: 3,
                background: "rgba(30,30,40,0.9)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 0 20px rgba(147,51,234,0.3)",
                color: "#fff",
              },
            }}
          >
            <MenuItem onClick={() => handleMenuClose("all")}>
              📦 แสดงทั้งหมด
            </MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat._id} onClick={() => handleMenuClose(cat._id)}>
                🗂 {cat.name}
              </MenuItem>
            ))}
          </Menu>
        </Box>

        {/* Search Field */}
        <SearchInput
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
        />

        {/* Products */}
        <Box
          sx={{
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "20px",
            padding: 5,
            boxShadow: "0 0 50px rgba(147, 51, 234, 0.2)",
            maxWidth: "1500px",
            mx: "auto",
          }}
        >
          {filteredProducts.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Typography
                variant="h6"
                sx={{ color: "#fff", mb: 2 }}
              >
                📦 ไม่พบสินค้า
              </Typography>
              <Typography sx={{ color: "#bbb" }}>
                {searchTerm ? `ไม่พบสินค้าที่ตรงกับ "${searchTerm}"` : "ไม่พบสินค้าในหมวดหมู่นี้"}
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
                พบสินค้า {filteredProducts.length} รายการ
              </Typography>
              
              <Grid container spacing={4} justifyContent="center">
                {filteredProducts.map((product, i) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    stock={stockMap[product._id] ?? 0}
                    index={i}
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

export default AllProductsPage;