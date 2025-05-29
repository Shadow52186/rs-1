import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  TextField,
  Typography,
  Stack,
  MenuItem,
  Grid,
  Divider,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const AddProduct = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [detail, setDetail] = useState("");
  const [price, setPrice] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");

  const [products, setProducts] = useState([]);
  const [editId, setEditId] = useState(null);
  const [stockMap, setStockMap] = useState({});
  const [isFeatured, setIsFeatured] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    const res = await axios.get(`${process.env.REACT_APP_API}/categories`);
    setCategories(res.data);
  };

  const fetchProducts = async () => {
    const res = await axios.get(`${process.env.REACT_APP_API}/product`);
    const products = res.data;
    setProducts(products);

    const stockCounts = {};
    await Promise.all(
      products.map(async (p) => {
        try {
          const stockRes = await axios.get(
            `${process.env.REACT_APP_API}/stock/${p._id}`
          );
          const available = stockRes.data.filter((s) => !s.isSold);
          stockCounts[p._id] = available.length;
        } catch {
          stockCounts[p._id] = 0;
        }
      })
    );
    setStockMap(stockCounts);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setName("");
    setDetail("");
    setPrice("");
    setImageFile(null);
    setPreview(null);
    setCategoryId("");
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !detail || !price || !categoryId) {
      return Swal.fire("ข้อมูลไม่ครบ", "กรุณากรอกให้ครบทุกช่อง", "warning");
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("detail", detail);
    formData.append("price", Number(price)); // ✅ ensure it's a number
    formData.append("categoryId", categoryId);
    formData.append("isFeatured", isFeatured); // ✅ ขาดไม่ได้!
    if (imageFile) formData.append("image", imageFile);

    const token = localStorage.getItem("token");

    try {
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      };

      if (editId) {
        console.log("🔧 Editing product:", editId);
        await axios.put(
          `${process.env.REACT_APP_API}/product/${editId}`,
          formData,
          config
        );
        Swal.fire("สำเร็จ", "แก้ไขสินค้าเรียบร้อยแล้ว", "success");
      } else {
        await axios.post(
          `${process.env.REACT_APP_API}/product/upload`,
          formData,
          config
        );
        Swal.fire("สำเร็จ", "เพิ่มสินค้าเรียบร้อยแล้ว", "success");
      }

      resetForm();
      fetchProducts();
    } catch (err) {
      console.error("❌ ERROR:", err);
      if (err.response?.data?.errors) {
        Swal.fire("ล้มเหลว", err.response.data.errors[0].msg, "error");
      } else {
        Swal.fire(
          "ล้มเหลว",
          err.response?.data || "ไม่สามารถบันทึกสินค้าได้",
          "error"
        );
      }
    }
  };

  const handleEdit = (product) => {
    setName(product.name);
    setDetail(product.detail);
    setPrice(product.price);
    setImageFile(null);
    setPreview(
      `${process.env.REACT_APP_API.replace("/api", "")}${product.image}`
    );
    setEditId(product._id);
    const foundCategory = categories.find(
      (cat) => cat._id === product.categoryId
    );
    setCategoryId(foundCategory ? product.categoryId : "");

    setIsFeatured(product.isFeatured || false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "คุณแน่ใจหรือไม่?",
      text: "สินค้าจะถูกลบถาวร!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
    });

    if (confirm.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${process.env.REACT_APP_API}/product/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        Swal.fire("ลบแล้ว", "สินค้าถูกลบเรียบร้อย", "success");
        fetchProducts();
      } catch (err) {
        console.error(err);
        Swal.fire("ล้มเหลว", "ไม่สามารถลบสินค้าได้", "error");
      }
    }
  };

  return (
    <Box p={4}>
      <Card sx={{ p: 4, maxWidth: 720, mx: "auto", mb: 6, borderRadius: 4 }}>
        <Typography variant="h5" fontWeight="bold" mb={2} color="primary">
          {editId ? "✏️ แก้ไขสินค้า" : "➕ เพิ่มสินค้าใหม่"}
        </Typography>

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <Stack spacing={2}>
            <TextField
              label="ชื่อสินค้า"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="รายละเอียดสินค้า"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              multiline
              rows={3}
              fullWidth
              required
            />
            <TextField
              label="ราคา (Point)"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              fullWidth
              required
            />
            <TextField
              select
              label="เลือกหมวดหมู่"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              fullWidth
              required
            >
              {categories.map((cat) => (
                <MenuItem key={cat._id} value={cat._id}>
                  {cat.name}
                </MenuItem>
              ))}
            </TextField>
            {/* ✅ ตรงนี้คือ Checkbox ใหม่ */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                />
              }
              label="แสดงในสินค้าแนะนำ"
            />

            <Button variant="outlined" component="label">
              เลือกรูปภาพ
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageChange}
              />
            </Button>

            {preview && (
              <Box textAlign="center">
                <img
                  src={preview}
                  alt="preview"
                  style={{ width: "100%", borderRadius: 12 }}
                />
              </Box>
            )}

            <Button
              variant="contained"
              type="submit"
              color="primary"
              size="large"
            >
              {editId ? "💾 บันทึกการแก้ไข" : "➕ เพิ่มสินค้า"}
            </Button>
          </Stack>
        </form>
      </Card>

      <Typography variant="h5" fontWeight="bold" mb={2}>
        🛒 รายการสินค้า
      </Typography>

      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product._id}>
            <Card sx={{ p: 2, borderRadius: 3 }}>
              <img
                src={product.image}
                alt={product.name}
                style={{
                  width: "100%",
                  height: 180,
                  objectFit: "cover",
                  borderRadius: 8,
                  marginBottom: 10,
                }}
              />
              <Typography fontWeight="bold" fontSize={16} gutterBottom>
                {product.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                💰 ราคา {product.price} point
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                📦 คงเหลือ: {stockMap[product._id] ?? "กำลังโหลด..."} ชิ้น
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Stack direction="row" spacing={1} justifyContent="center">
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleEdit(product)}
                >
                  ✏️ แก้ไข
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => handleDelete(product._id)}
                >
                  🗑 ลบ
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  color="secondary"
                  onClick={() => navigate(`/admin/stock/${product._id}`)}
                >
                  📦 สต็อก
                </Button>
              </Stack>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AddProduct;
