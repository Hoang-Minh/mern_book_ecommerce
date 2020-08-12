import React from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import Signup from "./user/Signup";
import Signin from "./user/Signin";
import Home from "./core/Home";
import PrivateRoute from "./auth/PrivateRoute";
import Dashboard from "./user/UserDashboard";
import AdminRoute from "./auth/AdminRoutes";
import AdminDashboard from "./user/AdminDashboard";
import AddCategory from "./admin/AddCategory";
import AddProduct from "./admin/AddProduct";
import Shop from "./core/Shop";
import Product from "./core/Product";
import Cart from "./core/Cart";
import Orders from "./admin/Order";
import Profile from "./user/Profile";
import ManageProducts from "./admin/ManageProducts";
import UpdateProduct from "./admin/UpdateProduct";

function Routes() {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/" exact component={Home}></Route>
        <Route path="/shop" exact component={Shop}></Route>
        <Route path="/signin" exact component={Signin}></Route>
        <Route path="/signup" exact component={Signup}></Route>
        <Route path="/products/:productId" exact component={Product}></Route>
        <Route path="/cart" exact component={Cart}></Route>
        <AdminRoute
          path="/admin/dashboard"
          exact
          component={AdminDashboard}
        ></AdminRoute>
        <AdminRoute
          path="/create/category"
          exact
          component={AddCategory}
        ></AdminRoute>
        <AdminRoute
          path="/create/product"
          exact
          component={AddProduct}
        ></AdminRoute>
        <AdminRoute path="/admin/orders" exact component={Orders}></AdminRoute>
        <AdminRoute
          path="/admin/products"
          exact
          component={ManageProducts}
        ></AdminRoute>
        <AdminRoute
          path="/admin/product/update/:productId"
          exact
          component={UpdateProduct}
        ></AdminRoute>
        <PrivateRoute
          path="/user/dashboard"
          exact
          component={Dashboard}
        ></PrivateRoute>
        <PrivateRoute
          path="/profile/:userId"
          exact
          component={Profile}
        ></PrivateRoute>
      </Switch>
    </BrowserRouter>
  );
}

export default Routes;
