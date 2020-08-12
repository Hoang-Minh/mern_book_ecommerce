import React from "react";
import { Route, Redirect } from "react-router-dom";
import { isAuthenticated } from "./index";

const AdminRoute = ({ component: Component, ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) => {
        const userAuthenticated = isAuthenticated();
        return userAuthenticated && userAuthenticated.user.role === 1 ? (
          <Component {...props}></Component>
        ) : (
          <Redirect
            to={{ pathname: "/signin", state: { from: props.location } }}
          ></Redirect>
        );
      }}
    ></Route>
  );
};

export default AdminRoute;
