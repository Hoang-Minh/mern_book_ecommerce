import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated } from "./index";

const AdminRoute = () => {
  const auth = isAuthenticated();
  return auth && auth.user.role === 1 ? <Outlet /> : <Navigate to="/signin" replace />;
};

export default AdminRoute;
