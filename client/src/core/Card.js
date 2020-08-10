import React, { useState } from "react";
import { Link, Redirect } from "react-router-dom";
import moment from "moment";
import ShowImage from "./ShowImage";
import { addItem } from "./cartHelpers";

function Card({ product, showViewProductButton = true }) {
  const [redirect, setRedirect] = useState(false);

  const showViewButton = (showViewProductButton) => {
    return (
      showViewProductButton && (
        <Link to={`/products/${product._id}`} className="mr-2">
          <div className="btn btn-outline-primary mt-2 mb-2">View Product</div>
        </Link>
      )
    );
  };

  const addToCart = (product) => {
    console.log("add to Cart", product);
    addItem(product, () => {
      setRedirect(true);
    });
  };

  const shouldRedirect = (redirect) => {
    if (redirect) return <Redirect to="/cart"></Redirect>;
  };

  const showAddToCartButton = () => (
    <button
      onClick={() => addToCart(product)}
      className="btn btn-outline-warning mt-2 mb-2"
    >
      Add to cart
    </button>
  );

  const showStock = (quantity) =>
    quantity > 0 ? (
      <span className="badge badge-primary badge-pill">In Stock</span>
    ) : (
      <span className="badge badge-primary badge-pill">Out of Stock</span>
    );

  return (
    <div className="card">
      <div className="card-header name">{product.name}</div>
      <div className="card-body">
        {shouldRedirect(redirect)}
        <ShowImage item={product} url="product"></ShowImage>
        <p className="lead mt-2">{product.description.substring(0, 10)}</p>
        <p className="black-10">${product.price}</p>
        <p className="black-9">
          Category: {product.category && product.category.name}
        </p>
        <p className="black-8">
          Added on: {moment(product.createdAt).fromNow()}
        </p>
        {showStock(product.quantity)}
        <br />
        {showViewButton(showViewProductButton)}
        {showAddToCartButton()}
      </div>
    </div>
  );
}

export default Card;
