import React, { useState } from "react";
import Layout from "../core/Layout";
import { isAuthenticated } from "../auth";
import { Link } from "react-router-dom";
import { createCategory } from "./apiAdmin";

const AddCategory = () => {
  const [name, setName] = useState("");
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  // destructure user and token from localStorage
  const { user, token } = isAuthenticated();

  const handleChange = (event) => {
    setError("");
    setName(event.target.value);
  };

  const clickSubmit = (event) => {
    event.preventDefault();

    setError("");
    setSuccess(false);

    // make request to api to create category
    createCategory(user._id, token, { name }).then((data) => {
      console.log(data);
      if (data.error) {
        setError(true);
      } else {
        setError(false);
        setSuccess(true);
      }
    });
  };

  const showSuccess = () => {
    if (success) {
      return <h3 className="text-success">{name} is created</h3>;
    }
  };

  const showError = () => {
    if (error) {
      return (
        <h3 className="text-danger">
          {name} Category has already been created before
        </h3>
      );
    }
  };

  const goBack = () => (
    <div className="mt-5">
      <Link to="/admin/dashboard" className="text-warning">
        Back to dashboard
      </Link>
    </div>
  );

  const newCategoryForm = () => (
    <form>
      <div className="form-group">
        <label className="text-muted">Name</label>
        <input
          text="text"
          className="form-control"
          onChange={handleChange}
          value={name}
          autoFocus
        ></input>
      </div>
      <button
        className="btn btn-outline-primary"
        onClick={(event) => clickSubmit(event)}
      >
        Create Cateogry
      </button>
    </form>
  );

  return (
    <Layout title="Add a new Category" description={`Hi, ${user.name}!`}>
      <div className="row">
        <div className="col-md-8 offset-md-2">
          {newCategoryForm()}
          {showSuccess()}
          {showError()}
          {goBack()}
        </div>
      </div>
    </Layout>
  );
};

export default AddCategory;
