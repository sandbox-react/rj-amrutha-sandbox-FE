import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Register from "../Pages/Register/Register";
import Login from "../Pages/Login/Login";
import ForgotPassword from "../Pages/ForgotPassword/ForgotPassword";
import DashboardLayout from "../Components/DashboardLayout/DashboardLayout";
import Dashboard from "../Pages/Dashboard/Dashboard";
import Analytics from "../Pages/Anayltics/Anayltics";
import Categories from "../Pages/Category/Categories";
import Uploads from "../Pages/Upload/Upload";
import CategoryFormPage from "../Pages/AddCategory/AddCategory";
import Products from "../Pages/Product/Product";
import ProductFormPage from "../Pages/AddProduct/ProductFormPage";
import Inventory from "../Pages/Inventory/Inventory";
import Orders from "../Pages/Orders/Orders";
import Customers from "../Pages/Customers/Customers";
import Coupons from "../Pages/Coupon/Coupon";
import CouponFormPage from "../Pages/AddCoupon/AddCoupon";
import BannerFormPage from "../Pages/AddBanner/AddBanner";
import Banners from "../Pages/Banners/Banner";
import Pages from "../Pages/SEOPage/Page";
import PageFormPage from "../Pages/AddPage/AddPage";
import ProductDashboard from "../Pages/ProductDashboard/ProductDashboard";
import SalesDashboard from "../Pages/SalesDashboard/SalesDashboard";
import InventoryDashboard from "../Pages/InventoryDashboard/InventoryDashboard";

const AppRouter = () => {
  const token = localStorage.getItem("token");

  const PublicOnlyRoute = ({ children }) => {
    return token ? <Navigate to="/" replace /> : children;
  };

  const PrivateRoute = ({ children }) => {
    return token ? children : <Navigate to="/login" replace />;
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth pages */}
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <Register />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicOnlyRoute>
              <ForgotPassword />
            </PublicOnlyRoute>
          }
        />

        {/* Protected dashboard routes */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="products" element={<Products />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="categories" element={<Categories />} />
          <Route path="orders" element={<Orders />} />
          <Route path="customers" element={<Customers />} />
          <Route path="coupons" element={<Coupons />} />
          <Route path="banners" element={<Banners />} />
          <Route path="pages" element={<Pages />} />
          <Route path="uploads" element={<Uploads />} />

          <Route path="categories/add" element={<CategoryFormPage />} />
          <Route path="categories/edit/:id" element={<CategoryFormPage />} />

          <Route path="products/add" element={<ProductFormPage />} />
          <Route path="products/edit/:id" element={<ProductFormPage />} />

          <Route path="coupons/add" element={<CouponFormPage />} />
          <Route path="coupons/edit/:id" element={<CouponFormPage />} />

          <Route path="cms/banners/add" element={<BannerFormPage />} />
          <Route path="cms/banners/edit/:id" element={<BannerFormPage />} />

          <Route path="cms/pages/add" element={<PageFormPage />} />
          <Route path="cms/pages/edit/:id" element={<PageFormPage />} />
          <Route path="product-dashboard" element={<ProductDashboard />} />
          <Route path="sales-dashboard" element={<SalesDashboard />} />
          <Route path="inventory-dashboard" element={<InventoryDashboard />} />
        </Route>

        {/* fallback */}
        <Route path="*" element={<Navigate to={token ? "/" : "/login"} replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;