import React, { useEffect, useState } from "react";
import {
  Paper,
  Container,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  TextField,
  Select,
  MenuItem,
  Stack,
  useMediaQuery,
  Box,
  Divider,
  Card,
} from "@mui/material";
import Swal from "sweetalert2";
import axios from "axios";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import { useTheme } from "@mui/material/styles";

const BASE_URL = (() => {
  const host = window.location.hostname;
  const productionDomains = [
    "rs-1-wgb9.vercel.app",
    "rs-1-shop-shadow52186s-projects.vercel.app",
    "rs-1-shop-5z0gmr152-shadow52186s-projects.vercel.app",
  ];

  if (host === "localhost") {
    return "http://localhost:5000/api";
  }

  if (productionDomains.includes(host)) {
    return "https://rs-shop-backend.onrender.com/api";
  }

  return "http://localhost:5000/api"; // fallback
})();

const ManageUser = () => {
  const [users, setUsers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [bannedIps, setBannedIps] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const isMobile = useMediaQuery("(max-width:768px)");
  const theme = useTheme();

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/users`, {
        headers: { Authorization: "Bearer " + token },
      });
      setUsers(res.data);
    } catch (err) {
      console.error("loadUsers error:", err);
    }
  };

  const loadBannedIps = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/banned-ips`, {
        headers: { Authorization: "Bearer " + token },
      });
      setBannedIps(res.data);
    } catch (err) {
      console.error("loadBannedIps error:", err);
    }
  };

  useEffect(() => {
    loadUsers();
    loadBannedIps();
  }, []);

  const handleEdit = (user) => {
    setEditing(user._id);
    setForm({ ...user, password: "" });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.put(`${BASE_URL}/user/${editing}`, form, {
        headers: { Authorization: "Bearer " + token },
      });
      Swal.fire("✅ สำเร็จ", "อัปเดตผู้ใช้เรียบร้อย", "success");
      setEditing(null);
      loadUsers();
    } catch (err) {
      Swal.fire("❌ ผิดพลาด", "ไม่สามารถอัปเดตผู้ใช้ได้", "error");
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "ลบผู้ใช้?",
      text: "คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้นี้",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบเลย",
      cancelButtonText: "ยกเลิก",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem("token");
        await axios.delete(`${BASE_URL}/user/${id}`, {
          headers: { Authorization: "Bearer " + token },
        });
        Swal.fire("ลบแล้ว!", "ผู้ใช้ถูกลบแล้ว", "success");
        loadUsers();
      }
    });
  };

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
      <Paper
        elevation={4}
        sx={{
          p: isMobile ? 2 : 4,
          borderRadius: 4,
          background: theme.palette.mode === "light" ? "#fff" : "#1e1e1e",
        }}
      >
        <Typography variant="h4" fontWeight="bold" mb={3}>
          👤 จัดการผู้ใช้ทั้งหมด
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <TextField
          label="🔍 ค้นหาชื่อผู้ใช้"
          variant="outlined"
          fullWidth
          size="small"
          sx={{ mb: 3 }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {isMobile ? (
          filteredUsers.map((u) => (
            <Card key={u._id} sx={{ mb: 2, p: 2, border: "1px solid #ddd", borderRadius: 2 }}>
              <Stack spacing={1}>
                <Typography>
                  <strong>ชื่อผู้ใช้:</strong>{" "}
                  {editing === u._id ? (
                    <TextField name="username" value={form.username} onChange={handleChange} size="small" fullWidth />
                  ) : (
                    u.username
                  )}
                </Typography>
                <Typography>
                  <strong>รหัสผ่าน:</strong>{" "}
                  {editing === u._id ? (
                    <TextField name="password" value={form.password} onChange={handleChange} type="password" size="small" fullWidth />
                  ) : (
                    "••••••••"
                  )}
                </Typography>
                <Typography>
                  <strong>สิทธิ์:</strong>{" "}
                  {editing === u._id ? (
                    <Select name="role" value={form.role} onChange={handleChange} size="small" fullWidth>
                      <MenuItem value="admin">admin</MenuItem>
                      <MenuItem value="user">user</MenuItem>
                    </Select>
                  ) : (
                    u.role
                  )}
                </Typography>
                <Typography>
                  <strong>Point:</strong>{" "}
                  {editing === u._id ? (
                    <TextField name="point" value={form.point} onChange={handleChange} type="number" size="small" fullWidth />
                  ) : (
                    u.point
                  )}
                </Typography>
                <Stack direction="row" spacing={1}>
                  {editing === u._id ? (
                    <>
                      <Button variant="contained" color="success" onClick={handleUpdate} startIcon={<SaveIcon />} size="small" fullWidth>
                        บันทึก
                      </Button>
                      <Button variant="outlined" onClick={() => setEditing(null)} startIcon={<CloseIcon />} size="small" fullWidth>
                        ยกเลิก
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outlined" onClick={() => handleEdit(u)} startIcon={<EditIcon />} size="small" fullWidth>
                        แก้ไข
                      </Button>
                      <Button variant="outlined" color="error" onClick={() => handleDelete(u._id)} startIcon={<DeleteIcon />} size="small" fullWidth>
                        ลบ
                      </Button>
                    </>
                  )}
                </Stack>
              </Stack>
            </Card>
          ))
        ) : (
          <Table size="medium">
            <TableHead>
              <TableRow>
                <TableCell><strong>ชื่อผู้ใช้</strong></TableCell>
                <TableCell><strong>รหัสผ่าน</strong></TableCell>
                <TableCell><strong>สิทธิ์</strong></TableCell>
                <TableCell><strong>Point</strong></TableCell>
                <TableCell align="center"><strong>การกระทำ</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((u) => (
                <TableRow key={u._id}>
                  <TableCell>
                    {editing === u._id ? (
                      <TextField name="username" value={form.username} onChange={handleChange} size="small" fullWidth />
                    ) : (
                      u.username
                    )}
                  </TableCell>
                  <TableCell>
                    {editing === u._id ? (
                      <TextField name="password" value={form.password} onChange={handleChange} type="password" size="small" fullWidth />
                    ) : (
                      "••••••••"
                    )}
                  </TableCell>
                  <TableCell>
                    {editing === u._id ? (
                      <Select name="role" value={form.role} onChange={handleChange} size="small" fullWidth>
                        <MenuItem value="admin">admin</MenuItem>
                        <MenuItem value="user">user</MenuItem>
                      </Select>
                    ) : (
                      u.role
                    )}
                  </TableCell>
                  <TableCell>
                    {editing === u._id ? (
                      <TextField name="point" value={form.point} onChange={handleChange} type="number" size="small" fullWidth />
                    ) : (
                      u.point
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      {editing === u._id ? (
                        <>
                          <Button onClick={handleUpdate} variant="contained" color="success" startIcon={<SaveIcon />} size="small">
                            บันทึก
                          </Button>
                          <Button onClick={() => setEditing(null)} variant="outlined" startIcon={<CloseIcon />} size="small">
                            ยกเลิก
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button onClick={() => handleEdit(u)} variant="outlined" startIcon={<EditIcon />} size="small">
                            แก้ไข
                          </Button>
                          <Button onClick={() => handleDelete(u._id)} variant="outlined" color="error" startIcon={<DeleteIcon />} size="small">
                            ลบ
                          </Button>
                        </>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <Box mt={5}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>🚫 IP ที่ถูกแบน (มากกว่า 25 ครั้ง)</Typography>
          <Divider sx={{ mb: 2 }} />
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>IP Address</strong></TableCell>
                <TableCell><strong>จำนวนครั้ง</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bannedIps.map((ip) => (
                <TableRow key={ip.ip}>
                  <TableCell>{ip.ip}</TableCell>
                  <TableCell>{ip.count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Paper>
    </Container>
  );
};

export default ManageUser;
