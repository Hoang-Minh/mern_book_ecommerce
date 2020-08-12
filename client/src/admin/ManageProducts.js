import React, { useState, useEffect } from "react";
import Layout from "../core/Layout";
import { isAuthenticated } from "../auth";
import { Link } from "react-router-dom";
import { getProducts, deleteProduct } from "./apiAdmin";

function ManageProducts() {
  const [products, setProducts] = useState([]);

  const { user, token } = isAuthenticated();

  const loadProducts = () => {
    getProducts().then((data) => {
      if (data.error) {
        console.log(data.error);
      } else {
        setProducts(data);
      }
    });
  };

  const destroy = (productId) => {
    deleteProduct(productId, user._id, token).then((data) => {
      if (data.error) {
        console.log(data.error);
      } else {
        loadProducts();
      }
    });
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <Layout
      title="Manage Products"
      description="Perform CRUD on products"
      className="container-fluid"
    >
      <div className="row">
        <div className="col-12">
          <h2 className="text-center">Total {products.length} products</h2>
          <hr />
          <ul className="list-group">
            {products.map((product, key) => (
              <li
                key={key}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <strong>{product.name}</strong>
                <div className="right">
                  <Link to={`/admin/product/update/${product._id}`}>
                    <span className="badge badge-warning badge-pill">
                      Update
                    </span>
                  </Link>
                  <span
                    style={{ cursor: "pointer", marginLeft: "1rem" }}
                    onClick={() => destroy(product._id)}
                    className="badge badge-danger badge-pill"
                  >
                    Delete
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Layout>
  );
}

export default ManageProducts;
