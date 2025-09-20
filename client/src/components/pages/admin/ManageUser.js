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
  Pagination,
  TableContainer,
  CircularProgress,
  Skeleton,
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

  return "http://localhost:5000/api";
})();

const initialForm = {
  username: "",
  password: "",
  role: "user",
  point: 0,
};

const ITEMS_PER_PAGE = 20; // เพิ่มจาก 10 เป็น 20

const ManageUser = () => {
  const [users, setUsers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [bannedIps, setBannedIps] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(false);
  const isMobile = useMediaQuery("(max-width:768px)");
  const theme = useTheme();

  const loadUsers = async (page = 1, search = "") => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || "";
      
      // เพิ่ม timestamp เพื่อบังคับไม่ใช้ cache
      const timestamp = Date.now();
      const res = await axios.get(`${BASE_URL}/admin/users?page=${page}&limit=${ITEMS_PER_PAGE}&search=${search}&_t=${timestamp}`, {
        headers: { 
          Authorization: "Bearer " + token,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
      });

      // รองรับทั้ง 2 format
      if (res.data && res.data.users && Array.isArray(res.data.users)) {
        // Format: { users: [...], total: 100, page: 1, totalPages: 5 }
        setUsers(res.data.users);
        setTotalUsers(res.data.total || 0);
        setCurrentPage(res.data.page || 1);
        setTotalPages(res.data.totalPages || 1);
      } else if (Array.isArray(res.data)) {
        // Fallback: ถ้า backend ยังส่ง array โดยตรง
        const allUsers = res.data;
        const filteredUsers = search ? 
          allUsers.filter(u => (u.username || "").toLowerCase().includes(search.toLowerCase())) : 
          allUsers;
        
        const startIndex = (page - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
        
        setUsers(paginatedUsers);
        setTotalUsers(filteredUsers.length);
        setCurrentPage(page);
        setTotalPages(Math.ceil(filteredUsers.length / ITEMS_PER_PAGE));
      }
    } catch (err) {
      console.error("loadUsers error:", err);
      setUsers([]);
      setTotalUsers(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
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
    loadUsers(currentPage, searchTerm);
    loadBannedIps();
  }, [currentPage]);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentPage === 1) {
        loadUsers(1, searchTerm);
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleEdit = (user) => {
    setEditing(user?._id ?? null);
    setForm({
      username: user?.username ?? "",
      password: "",
      role: user?.role ?? "user",
      point: typeof user?.point === "number" ? user.point : Number(user?.point) || 0,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let v = value;
    if (name === "point") {
      v = value === "" ? "" : Number(value);
    }
    setForm((prev) => ({ ...prev, [name]: v }));
  };

  const handleUpdate = async () => {
    if (!editing) return;
    const token = localStorage.getItem("token") || "";
    try {
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
      
      // Reload current page data
      loadUsers(currentPage, searchTerm);
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
          await axios.delete(`${BASE_URL}/admin/user/${id}`, {
            headers: { Authorization: "Bearer " + token },
          });
          
          Swal.fire("ลบแล้ว!", "ผู้ใช้ถูกลบแล้ว", "success");
          
          // Reload current page data
          loadUsers(currentPage, searchTerm);
        } catch (err) {
          console.error("delete error:", err);
          Swal.fire("❌ ผิดพลาด", "ลบไม่สำเร็จ", "error");
        }
      }
    });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const renderSkeletonRows = () => {
    return Array.from({ length: 5 }).map((_, index) => (
      <TableRow key={index}>
        <TableCell><Skeleton width="80%" /></TableCell>
        <TableCell><Skeleton width="60%" /></TableCell>
        <TableCell><Skeleton width="50%" /></TableCell>
        <TableCell><Skeleton width="40%" /></TableCell>
        <TableCell align="center">
          <Stack direction="row" spacing={1} justifyContent="center">
            <Skeleton variant="rectangular" width={60} height={32} />
            <Skeleton variant="rectangular" width={60} height={32} />
          </Stack>
        </TableCell>
      </TableRow>
    ));
  };

  const renderSkeletonCards = () => {
    return Array.from({ length: 3 }).map((_, index) => (
      <Card key={index} sx={{ mb: 2, p: 2, border: "1px solid #ddd", borderRadius: 2 }}>
        <Stack spacing={1}>
          <Skeleton width="70%" />
          <Skeleton width="50%" />
          <Skeleton width="60%" />
          <Skeleton width="40%" />
          <Stack direction="row" spacing={1}>
            <Skeleton variant="rectangular" width="48%" height={36} />
            <Skeleton variant="rectangular" width="48%" height={36} />
          </Stack>
        </Stack>
      </Card>
    ));
  };

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endIndex = Math.min(currentPage * ITEMS_PER_PAGE, totalUsers);

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

        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <TextField
            label="🔍 ค้นหาชื่อผู้ใช้"
            variant="outlined"
            size="small"
            sx={{ width: isMobile ? "100%" : "300px" }}
            value={searchTerm}
            onChange={handleSearchChange}
            disabled={loading}
          />
          
          {loading ? (
            <CircularProgress size={20} />
          ) : (
            <Typography variant="body2" color="text.secondary">
              แสดง {totalUsers > 0 ? startIndex : 0}-{endIndex} จาก {totalUsers.toLocaleString()} รายการ
            </Typography>
          )}
        </Stack>

        {loading ? (
          isMobile ? renderSkeletonCards() : (
            <TableContainer>
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
                  {renderSkeletonRows()}
                </TableBody>
              </Table>
            </TableContainer>
          )
        ) : (
          <>
            {isMobile ? (
              <>
                {users.length === 0 ? (
                  <Typography align="center" color="text.secondary" sx={{ py: 4 }}>
                    ไม่พบผู้ใช้
                  </Typography>
                ) : (
                  users.map((u) => (
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
                            (typeof u?.point === "number" ? u.point : Number(u?.point) || 0).toLocaleString()
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
                )}
              </>
            ) : (
              <TableContainer>
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
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Typography color="text.secondary" sx={{ py: 4 }}>
                            ไม่พบผู้ใช้
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((u) => (
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
                              (typeof u?.point === "number" ? u.point : Number(u?.point) || 0).toLocaleString()
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
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </>
        )}

        {/* Pagination Component */}
        {totalPages > 1 && (
          <Box mt={3} display="flex" justifyContent="center">
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              size={isMobile ? "small" : "medium"}
              showFirstButton
              showLastButton
              disabled={loading}
            />
          </Box>
        )}

        <Box mt={5}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            🚫 IP ที่ถูกแบน (มากกว่า 25 ครั้ง)
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <TableContainer>
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
                    <TableCell>{(typeof ip?.count === "number" ? ip.count : Number(ip?.count) || 0).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Paper>
    </Container>
  );
};

export default ManageUser;