import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Box, Typography, Grid, Button } from "@mui/material";
import { motion } from "framer-motion";
import Particles from "../../../components/effects/Particles";
import Threads from "../../../components/effects/Threads";

const CategoryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [stockMap, setStockMap] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoryRes = await axios.get(`${process.env.REACT_APP_API}/categories/${id}`);
        const productRes = await axios.get(`${process.env.REACT_APP_API}/product?categoryId=${id}`);
        const productsData = productRes.data;

        setCategoryName(categoryRes.data.name);
        setProducts(productsData);

        const stockCounts = {};
        await Promise.all(
          productsData.map(async (product) => {
            try {
              const res = await axios.get(`${process.env.REACT_APP_API}/stock/${product._id}`);
              const stocks = res.data || [];
              const available = stocks.filter((s) => !s.isSold);
              stockCounts[product._id] = available.length;
            } catch {
              stockCounts[product._id] = 0;
            }
          })
        );
        setStockMap(stockCounts);
      } catch (err) {
        console.error("❌ Failed to load category page", err);
      }
    };

    fetchData();
  }, [id]);

  const handleViewProduct = (productId) => {
    navigate(`/product/${productId}`);
  };

  return (
    <Box sx={{ position: "relative", minHeight: "100vh", overflowX: "hidden" }}>
      {/* ✅ Background */}
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
          particleCount={250}
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

      {/* ✅ Content */}
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
            minHeight: "80vh",
            width: "100%",
            maxWidth: "1500px",
            mx: "auto",
          }}
        >
          <Grid container spacing={4} justifyContent="center">
            {products.map((product, index) => {
              const imageUrl = product.image;
              const stock = stockMap[product._id] ?? 0;

              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
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
                      <Box
                        component="img"
                        src={imageUrl}
                        alt={product.name}
                        sx={{
                          width: "300px",
                          height: "230px",
                          objectFit: "cover",
                          display: "block",
                          borderTopLeftRadius: "24px",
                          borderTopRightRadius: "24px",
                        }}
                      />
                    </Box>

                    <Box sx={{ px: 2, py: 2, flexGrow: 1 }}>
                      <Typography
                        fontWeight="bold"
                        fontSize="18px"
                        sx={{ color: "#fff", mb: 1 }}
                      >
                        {product.name}
                      </Typography>

                      <Typography fontSize="14px" sx={{ color: "#bbb", mb: 1 }}>
                        📝 {product.detail?.slice(0, 50)}...
                      </Typography>

                      <Typography
                        fontSize="16px"
                        fontWeight="bold"
                        sx={{ color: "#4ade80" }}
                      >
                        💰 {product.price} POINT
                      </Typography>

                      <Typography fontSize="14px" sx={{ color: "#10b981", mb: 2 }}>
                        ✅ คงเหลือ: {stock}
                      </Typography>

                      <Button
                        onClick={() => handleViewProduct(product._id)}
                        fullWidth
                        sx={{
                          background: "linear-gradient(90deg, #6366f1, #a855f7)",
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: "15px",
                          borderRadius: "999px",
                          textTransform: "none",
                          boxShadow: "0 0 12px rgba(147,51,234,0.4)",
                          py: 1.2,
                          transition: "0.3s",
                          "&:hover": {
                            background: "linear-gradient(90deg, #7c3aed, #4f46e5)",
                            boxShadow: "0 0 20px rgba(147,51,234,0.7)",
                            transform: "scale(1.03)",
                          },
                        }}
                      >
                        👁️ ดูเพิ่มเติม
                      </Button>
                    </Box>
                  </motion.div>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default CategoryPage;
