import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import axios from "axios";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";


const ManageStock = () => {
  const { id } = useParams();
  const [product, setProduct] = useState({});
  const [stockList, setStockList] = useState([]);
  const [form, setForm] = useState({ username: "", password: "" });
  const [editId, setEditId] = useState(null); // ID ที่กำลังแก้ไข

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    const config = { headers: { Authorization: `Bearer ${token}` } };

    const res = await axios.get(`${process.env.REACT_APP_API}/product`);
    const currentProduct = res.data.find((p) => p._id === id);
    setProduct(currentProduct);

    const stock = await axios.get(`${process.env.REACT_APP_API}/stock/${id}`);
    const visibleStock = stock.data.filter((s) => !s.isSold);
    setStockList(visibleStock);
  };

  const handleAdd = async () => {
    const token = localStorage.getItem("token");
    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      await axios.post(
        `${process.env.REACT_APP_API}/stock`,
        { productId: id, ...form },
        config
      );
      setForm({ username: "", password: "" });
      await fetchData();

      // ✅ แสดงข้อความเพิ่มสำเร็จ
      Swal.fire("สำเร็จ", "เพิ่ม Stock เรียบร้อยแล้ว", "success");
    } catch (err) {
      console.error("เพิ่มไม่สำเร็จ", err);
      Swal.fire("ล้มเหลว", "ไม่สามารถเพิ่ม Stock ได้", "error");
    }
  };

  const handleDelete = async (stockId) => {
    const token = localStorage.getItem("token");
    const config = { headers: { Authorization: `Bearer ${token}` } };

    await axios.delete(`${process.env.REACT_APP_API}/stock/${stockId}`, config);
    fetchData();
  };

  const handleEdit = (stock) => {
    setEditId(stock._id);
    setForm({ username: stock.username, password: stock.password });
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      await axios.put(
        `${process.env.REACT_APP_API}/stock/${editId}`,
        {
          username: form.username,
          password: form.password,
        },
        config
      );
      setEditId(null);
      setForm({ username: "", password: "" });
      await fetchData();

      // ✅ แสดงข้อความแก้ไขสำเร็จ
      Swal.fire("สำเร็จ", "แก้ไข Stock เรียบร้อยแล้ว", "success");
    } catch (err) {
      console.error("แก้ไขไม่สำเร็จ", err);
      Swal.fire("ล้มเหลว", "ไม่สามารถแก้ไข Stock ได้", "error");
    }
  };

  return (
    <Box maxWidth="900px" mx="auto" mt={5}>
      <Typography variant="h5" fontWeight="bold" mb={3}>
        จัดการสต็อกสินค้า: {product.name}
      </Typography>

      <Box display="flex" gap={2} mb={3}>
        <TextField
          label="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
        <TextField
          label="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        {editId ? (
          <Button variant="contained" color="warning" onClick={handleSave}>
            บันทึก
          </Button>
        ) : (
          <Button variant="contained" onClick={handleAdd}>
            เพิ่ม
          </Button>
        )}
      </Box>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Password</TableCell>
              <TableCell align="right">จัดการ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stockList.map((s) => (
              <TableRow key={s._id}>
                <TableCell>{s.username}</TableCell>
                <TableCell>{s.password}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleEdit(s)}>
                    <EditIcon color="info" />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(s._id)}>
                    <DeleteIcon color="error" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default ManageStock;
