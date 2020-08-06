import React, { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../core//Layout";
import { signup } from "../auth";

function Signup() {
  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
    error: "",
    success: false,
  });

  const handleChange = (name) => (event) => {
    setValues({ ...values, error: false, [name]: event.target.value });
  };

  const { name, email, password, success, error } = values;

  const clickSubmit = (event) => {
    event.preventDefault();
    setValues({ ...values, error: false });
    signup({ name, email, password }).then((data) => {
      console.log(data);
      if (data.error) {
        setValues({ ...values, error: data.error, success: false });
      } else {
        setValues({
          ...values,
          name: "",
          email: "",
          password: "",
          error: "",
          success: true,
        });
      }
    });
  };

  const signUpForm = () => (
    <form>
      <div className="form-group">
        <label className="text-muted">Name</label>
        <input
          autoComplete="off"
          onChange={handleChange("name")}
          type="text"
          className="form-control"
          values={name}
        ></input>
      </div>
      <div className="form-group">
        <label className="text-muted">Email</label>
        <input
          autoComplete="off"
          onChange={handleChange("email")}
          type="email"
          className="form-control"
          values={email}
        ></input>
      </div>
      <div className="form-group">
        <label className="text-muted">Password</label>
        <input
          autoComplete="off"
          onChange={handleChange("password")}
          type="password"
          className="form-control"
          values={password}
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

  const showSuccess = () => (
    <div
      className="alert alert-info"
      style={{ display: success ? "" : "none" }}
    >
      New account is created. Please <Link to="/signin">Sign In</Link>
    </div>
  );

  return (
    <Layout
      title="Signup"
      description="Sign up to Node React E-commerce App"
      className="container col-md-8 offset-md-2"
    >
      {showSuccess()}
      {showError()}
      {signUpForm()}
    </Layout>
  );
}

export default Signup;
