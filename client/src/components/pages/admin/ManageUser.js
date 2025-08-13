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
    "rs-shop.site",
    "www.rs-shop.site",
  ];

  if (host === "localhost") {
    return "http://localhost:5000/api";
  }

  if (productionDomains.includes(host)) {
    return "https://rs-shop-backend.onrender.com/api";
  }

  return "http://localhost:5000/api"; // fallback
})();

const initialForm = {
  username: "",
  password: "",
  role: "user",
  point: 0,
};

const ManageUser = () => {
  const [users, setUsers] = useState([]);
  const [editing, setEditing] = useState(null); // user._id
  const [form, setForm] = useState(initialForm);
  const [bannedIps, setBannedIps] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const isMobile = useMediaQuery("(max-width:768px)");
  const theme = useTheme();

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem("token") || "";
      const res = await axios.get(`${BASE_URL}/users`, {
        headers: { Authorization: "Bearer " + token },
      });
      const data = Array.isArray(res.data) ? res.data : [];
      setUsers(data);
    } catch (err) {
      console.error("loadUsers error:", err);
      setUsers([]);
    }
  };

  const loadBannedIps = async () => {
    try {
      const token = localStorage.getItem("token") || "";
      const res = await axios.get(`${BASE_URL}/banned-ips`, {
        headers: { Authorization: "Bearer " + token },
      });
      const data = Array.isArray(res.data) ? res.data : [];
      setBannedIps(data);
    } catch (err) {
      console.error("loadBannedIps error:", err);
      setBannedIps([]);
    }
  };

  useEffect(() => {
    loadUsers();
    loadBannedIps();
  }, []);

  const handleEdit = (user) => {
    setEditing(user?._id ?? null);
    // ป้องกัน undefined ทุกฟิลด์
    setForm({
      username: user?.username ?? "",
      password: "", // เวลาจะแก้ค่อยกรอกใหม่
      role: user?.role ?? "user",
      point: typeof user?.point === "number" ? user.point : Number(user?.point) || 0,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let v = value;
    if (name === "point") {
      // บังคับเป็นตัวเลขเสมอ
      v = value === "" ? "" : Number(value);
    }
    setForm((prev) => ({ ...prev, [name]: v }));
  };

  const handleUpdate = async () => {
    if (!editing) return;
    const token = localStorage.getItem("token") || "";
    try {
      // สร้าง payload ที่สะอาด
      const payload = {
        username: (form.username ?? "").toString().trim(),
        role: (form.role ?? "user"),
        point: Number(form.point) || 0,
      };
      if ((form.password ?? "").toString().trim() !== "") {
        payload.password = form.password;
      }

      await axios.put(`${BASE_URL}/user/${editing}`, payload, {
        headers: { Authorization: "Bearer " + token },
      });
      Swal.fire("✅ สำเร็จ", "อัปเดตผู้ใช้เรียบร้อย", "success");
      setEditing(null);
      setForm(initialForm);
      loadUsers();
    } catch (err) {
      console.error("update error:", err);
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
        try {
          const token = localStorage.getItem("token") || "";
          await axios.delete(`${BASE_URL}/user/${id}`, {
            headers: { Authorization: "Bearer " + token },
          });
          Swal.fire("ลบแล้ว!", "ผู้ใช้ถูกลบแล้ว", "success");
          loadUsers();
        } catch (err) {
          console.error("delete error:", err);
          Swal.fire("❌ ผิดพลาด", "ลบไม่สำเร็จ", "error");
        }
      }
    });
  };

  // ------ Safe filter กัน undefined ทุกกรณี ------
  const safeSearch = (searchTerm ?? "").toString().toLowerCase().trim();
  const filteredUsers = (users ?? []).filter((u) => {
    const name = (u?.username ?? "").toString().toLowerCase();
    return name.includes(safeSearch);
  });

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
          (filteredUsers ?? []).map((u) => (
            <Card
              key={u?._id ?? Math.random()}
              sx={{ mb: 2, p: 2, border: "1px solid #ddd", borderRadius: 2 }}
            >
              <Stack spacing={1}>
                <Typography>
                  <strong>ชื่อผู้ใช้:</strong>{" "}
                  {editing === u?._id ? (
                    <TextField
                      name="username"
                      value={form.username ?? ""}
                      onChange={handleChange}
                      size="small"
                      fullWidth
                    />
                  ) : (
                    u?.username ?? "-"
                  )}
                </Typography>

                <Typography>
                  <strong>รหัสผ่าน:</strong>{" "}
                  {editing === u?._id ? (
                    <TextField
                      name="password"
                      value={form.password ?? ""}
                      onChange={handleChange}
                      type="password"
                      size="small"
                      fullWidth
                    />
                  ) : (
                    "••••••••"
                  )}
                </Typography>

                <Typography>
                  <strong>สิทธิ์:</strong>{" "}
                  {editing === u?._id ? (
                    <Select
                      name="role"
                      value={form.role ?? "user"}
                      onChange={handleChange}
                      size="small"
                      fullWidth
                    >
                      <MenuItem value="admin">admin</MenuItem>
                      <MenuItem value="user">user</MenuItem>
                    </Select>
                  ) : (
                    u?.role ?? "-"
                  )}
                </Typography>

                <Typography>
                  <strong>Point:</strong>{" "}
                  {editing === u?._id ? (
                    <TextField
                      name="point"
                      value={form.point ?? 0}
                      onChange={handleChange}
                      type="number"
                      size="small"
                      fullWidth
                    />
                  ) : (
                    typeof u?.point === "number" ? u.point : Number(u?.point) || 0
                  )}
                </Typography>

                <Stack direction="row" spacing={1}>
                  {editing === u?._id ? (
                    <>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={handleUpdate}
                        startIcon={<SaveIcon />}
                        size="small"
                        fullWidth
                      >
                        บันทึก
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setEditing(null);
                          setForm(initialForm);
                        }}
                        startIcon={<CloseIcon />}
                        size="small"
                        fullWidth
                      >
                        ยกเลิก
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outlined"
                        onClick={() => handleEdit(u)}
                        startIcon={<EditIcon />}
                        size="small"
                        fullWidth
                      >
                        แก้ไข
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => handleDelete(u?._id)}
                        startIcon={<DeleteIcon />}
                        size="small"
                        fullWidth
                      >
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
              {(filteredUsers ?? []).map((u) => (
                <TableRow key={u?._id ?? Math.random()}>
                  <TableCell>
                    {editing === u?._id ? (
                      <TextField
                        name="username"
                        value={form.username ?? ""}
                        onChange={handleChange}
                        size="small"
                        fullWidth
                      />
                    ) : (
                      u?.username ?? "-"
                    )}
                  </TableCell>
                  <TableCell>
                    {editing === u?._id ? (
                      <TextField
                        name="password"
                        value={form.password ?? ""}
                        onChange={handleChange}
                        type="password"
                        size="small"
                        fullWidth
                      />
                    ) : (
                      "••••••••"
                    )}
                  </TableCell>
                  <TableCell>
                    {editing === u?._id ? (
                      <Select
                        name="role"
                        value={form.role ?? "user"}
                        onChange={handleChange}
                        size="small"
                        fullWidth
                      >
                        <MenuItem value="admin">admin</MenuItem>
                        <MenuItem value="user">user</MenuItem>
                      </Select>
                    ) : (
                      u?.role ?? "-"
                    )}
                  </TableCell>
                  <TableCell>
                    {editing === u?._id ? (
                      <TextField
                        name="point"
                        value={form.point ?? 0}
                        onChange={handleChange}
                        type="number"
                        size="small"
                        fullWidth
                      />
                    ) : (
                      typeof u?.point === "number" ? u.point : Number(u?.point) || 0
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      {editing === u?._id ? (
                        <>
                          <Button
                            onClick={handleUpdate}
                            variant="contained"
                            color="success"
                            startIcon={<SaveIcon />}
                            size="small"
                          >
                            บันทึก
                          </Button>
                          <Button
                            onClick={() => {
                              setEditing(null);
                              setForm(initialForm);
                            }}
                            variant="outlined"
                            startIcon={<CloseIcon />}
                            size="small"
                          >
                            ยกเลิก
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            onClick={() => handleEdit(u)}
                            variant="outlined"
                            startIcon={<EditIcon />}
                            size="small"
                          >
                            แก้ไข
                          </Button>
                          <Button
                            onClick={() => handleDelete(u?._id)}
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteIcon />}
                            size="small"
                          >
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
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            🚫 IP ที่ถูกแบน (มากกว่า 25 ครั้ง)
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>IP Address</strong></TableCell>
                <TableCell><strong>จำนวนครั้ง</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(bannedIps ?? []).map((ip) => (
                <TableRow key={(ip?.ip ?? "") + (ip?.count ?? "")}>
                  <TableCell>{ip?.ip ?? "-"}</TableCell>
                  <TableCell>{typeof ip?.count === "number" ? ip.count : Number(ip?.count) || 0}</TableCell>
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
