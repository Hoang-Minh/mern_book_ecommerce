import React, { useState } from "react";
import { Redirect } from "react-router-dom";
import Layout from "../core//Layout";
import { signin, authenticate } from "../auth";

function Signin() {
  const [values, setValues] = useState({
    email: "abc@yahoo.com",
    password: "minh123",
    error: "",
    loading: false,
    redirecToReferrer: false,
  });

  const handleChange = (name) => (event) => {
    setValues({ ...values, error: false, [name]: event.target.value });
  };

  const { email, password, loading, error, redirecToReferrer } = values;

  const clickSubmit = (event) => {
    event.preventDefault();
    setValues({ ...values, error: false, loading: true });
    signin({ email, password }).then((data) => {
      console.log(data);
      if (data.error) {
        setValues({ ...values, error: data.error, loading: false });
      } else {
        authenticate(data, () => {
          setValues({
            ...values,
            redirecToReferrer: true,
          });
        });
      }
    });
  };

  const signInForm = () => (
    <form>
      <div className="form-group">
        <label className="text-muted">Email</label>
        <input
          autoComplete="off"
          onChange={handleChange("email")}
          type="email"
          className="form-control"
          value={email}
        ></input>
      </div>
      <div className="form-group">
        <label className="text-muted">Password</label>
        <input
          autoComplete="off"
          onChange={handleChange("password")}
          type="password"
          className="form-control"
          value={password}
        ></input>
      </div>
      <button onClick={clickSubmit} className="btn btn-primary">
        Submit
      </button>
    </form>
  );

  const showError = () => (
    <div
      className="alert alert-danger"
      style={{ display: error ? "" : "none" }}
    >
      {error}
    </div>
  );

  const showLoading = () =>
    loading && (
      <div className="alert alert-info">
        <h2>Loading....</h2>
      </div>
    );

  const redirectUser = () => {
    if (redirecToReferrer) return <Redirect to="/"></Redirect>;
  };

  return (
    <Layout
      title="SignIn"
      description="Sign In to Node React E-commerce App"
      className="container col-md-8 offset-md-2"
    >
      {showLoading()}
      {showError()}
      {signInForm()}
      {redirectUser()}
    </Layout>
  );
}

export default Signin;
