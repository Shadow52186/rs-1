import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  Grid,
  Button,
  Stack,
  TextField,
} from "@mui/material";
import axios from "axios";
import Swal from "sweetalert2";

const ManageCategory = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [editId, setEditId] = useState(null); // ถ้ามี editId แสดงว่าอยู่ในโหมดแก้ไข

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API}/categories`);
      setCategories(res.data);
    } catch (err) {
      console.error("โหลดหมวดหมู่ล้มเหลว", err);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name) {
      return Swal.fire("กรอกข้อมูลไม่ครบ", "กรุณาใส่ชื่อหมวดหมู่", "warning");
    }

    const formData = new FormData();
    formData.append("name", name);
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      if (editId) {
        await axios.put(`${process.env.REACT_APP_API}/category/${editId}`, formData);
        Swal.fire("สำเร็จ", "แก้ไขหมวดหมู่เรียบร้อยแล้ว", "success");
      } else {
        await axios.post(`${process.env.REACT_APP_API}/category/upload`, formData);
        Swal.fire("สำเร็จ", "เพิ่มหมวดหมู่เรียบร้อยแล้ว", "success");
      }

      // reset form
      setName("");
      setImageFile(null);
      setPreview(null);
      setEditId(null);
      fetchCategories();
    } catch (err) {
      console.error(err);
      Swal.fire("ล้มเหลว", "ไม่สามารถบันทึกข้อมูลได้", "error");
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "คุณแน่ใจหรือไม่?",
      text: "หมวดหมู่จะถูกลบถาวร!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
    });

    if (confirm.isConfirmed) {
      try {
        await axios.delete(`${process.env.REACT_APP_API}/category/${id}`);
        Swal.fire("ลบแล้ว", "หมวดหมู่ถูกลบเรียบร้อย", "success");
        fetchCategories();
      } catch (err) {
        console.error(err);
        Swal.fire("ล้มเหลว", "ไม่สามารถลบหมวดหมู่ได้", "error");
      }
    }
  };

  const handleEdit = (cat) => {
    setEditId(cat._id);
    setName(cat.name);
    setPreview(cat.image); // ✅ ใช้ URL จาก Cloudinary โดยตรง
    setImageFile(null); // รอผู้ใช้เลือกใหม่
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Box p={4}>
      {/* ฟอร์มเพิ่ม/แก้ไขหมวดหมู่ */}
      <Card sx={{ p: 4, mb: 4, maxWidth: 500 }}>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          {editId ? "แก้ไขหมวดหมู่" : "เพิ่มหมวดหมู่ใหม่"}
        </Typography>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <Stack spacing={2}>
            <TextField
              label="ชื่อหมวดหมู่"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Button variant="outlined" component="label">
              เลือกรูปภาพ
              <input type="file" accept="image/*" hidden onChange={handleImageChange} />
            </Button>
            {preview && (
              <img
                src={preview}
                alt="preview"
                style={{ width: "100%", borderRadius: 8 }}
              />
            )}
            <Button variant="contained" type="submit" color="primary">
              {editId ? "บันทึกการแก้ไข" : "เพิ่มหมวดหมู่"}
            </Button>
          </Stack>
        </form>
      </Card>

      {/* รายการหมวดหมู่ */}
      <Typography variant="h5" fontWeight="bold" mb={3}>
        รายการหมวดหมู่
      </Typography>
      <Grid container spacing={3}>
        {categories.map((cat) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={cat._id}>
            <Card sx={{ p: 2, borderRadius: 2, textAlign: "center" }}>
              <img
                src={cat.image} // ✅ Cloudinary URL ใช้ตรง ๆ ได้เลย
                alt={cat.name}
                style={{
                  width: "100%",
                  height: "150px",
                  objectFit: "cover",
                  borderRadius: 8,
                  marginBottom: 10,
                }}
              />
              <Typography fontWeight="bold">{cat.name}</Typography>
              <Stack direction="row" justifyContent="center" spacing={1} mt={2}>
                <Button
                  color="error"
                  variant="outlined"
                  size="small"
                  onClick={() => handleDelete(cat._id)}
                >
                  ลบ
                </Button>
                <Button
                  color="primary"
                  variant="outlined"
                  size="small"
                  onClick={() => handleEdit(cat)}
                >
                  แก้ไข
                </Button>
              </Stack>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ManageCategory;
