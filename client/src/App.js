import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { login } from "./store/userSlice";
import { CssBaseline } from "@mui/material";

// Admin Pages
import ManageUser from "./components/pages/admin/ManageUser";
import ManageCategory from "./components/pages/admin/ManageCategory";
import Addproduct from "./components/pages/admin/Addproduct";
import EditProduct from "./components/EditProduct";
import ManageStock from "./components/pages/admin/ManageStock";
import StatsSalesPage from "./components/pages/admin/StatsSalesPage";
import AdminSalesHistoryPage from "./components/pages/admin/AdminSalesHistoryPage";

// User Pages
import HomePage from "./components/pages/user/HomePage";
import CategoryPage from "./components/pages/user/CategoryPage";
import AllProductsPage from "./components/pages/user/AllProductsPage";
import ProductDetailPage from "./components/pages/user/ProductDetailPage";
import UserProfilePage from "./components/pages/user/UserProfilePage";
import PromotionPage from "./components/pages/user/PromotionPage";
import TopupHistoryPage from "./components/pages/user/TopupHistoryPage";
import TopupPage from "./components/pages/user/TopupPage";
import PurchaseHistoryPage from "./components/pages/user/PurchaseHistoryPage";
import WelcomePage from "./components/pages/user/WelcomePage"; // ✅ เพิ่มตรงนี้

// Auth Pages
import Register from "./components/pages/auth/Register";
import Login from "./components/pages/auth/Login";

// Layout
import ResponsiveAppBar from "./layout/ResponsiveAppBar";
import Footer from "./layout/Footer";

// Other
import NotFound404 from "./components/pages/Notfound404";
import AdminRoute from "./routes/AdminRoute";

function App() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.value);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      dispatch(login(decoded));
    }
    setLoading(false);
  }, [dispatch]);

  if (loading) return <p style={{ textAlign: "center" }}>Loading...</p>;

  return (
    <Router>
      <CssBaseline />
      <Routes>
        {/* ✅ หน้าแรก = WelcomePage */}
        <Route path="/" element={<WelcomePage />} />

        {/* ✅ Auth */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* ✅ หน้าผิดพลาด */}
        <Route path="*" element={<NotFound404 />} />

        {/* ✅ หน้า User มี Navbar + Footer */}
        <Route
          path="/user/*"
          element={
            <>
              <ResponsiveAppBar />
              <Routes>
                <Route path="index" element={<HomePage />} />
                <Route path="profile" element={<UserProfilePage />} />
                <Route path="history" element={<PurchaseHistoryPage />} />
              </Routes>
              <Footer />
            </>
          }
        />

        <Route
          path="/category/:id"
          element={
            <>
              <ResponsiveAppBar />
              <CategoryPage />
              <Footer />
            </>
          }
        />
        <Route
          path="/products"
          element={
            <>
              <ResponsiveAppBar />
              <AllProductsPage />
              <Footer />
            </>
          }
        />
        <Route
          path="/product/:id"
          element={
            <>
              <ResponsiveAppBar />
              <ProductDetailPage />
              <Footer />
            </>
          }
        />
        <Route
          path="/topup"
          element={
            <>
              <ResponsiveAppBar />
              <TopupPage />
              <Footer />
            </>
          }
        />
        <Route
          path="/topup/history"
          element={
            <>
              <ResponsiveAppBar />
              <TopupHistoryPage />
              <Footer />
            </>
          }
        />
        <Route
          path="/promotions"
          element={
            <>
              <ResponsiveAppBar />
              <PromotionPage />
              <Footer />
            </>
          }
        />

        {/* ✅ Admin Pages ไม่มี Navbar หรือ Footer */}
        <Route
          path="/admin/viewtable"
          element={
            <AdminRoute>
              <Addproduct />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/edit/:id"
          element={
            <AdminRoute>
              <EditProduct />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/manage"
          element={
            <AdminRoute>
              <ManageUser />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/manage-category"
          element={
            <AdminRoute>
              <ManageCategory />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/stock/:id"
          element={
            <AdminRoute>
              <ManageStock />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/stats/sales"
          element={
            <AdminRoute>
              <StatsSalesPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/sales-history"
          element={
            <AdminRoute>
              <AdminSalesHistoryPage />
            </AdminRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
