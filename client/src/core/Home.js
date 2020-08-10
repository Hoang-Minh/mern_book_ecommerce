import React, { useState, useEffect } from "react";
import Layout from "./Layout";
import { getProducts } from "./apiCore";
import Card from "./Card";
import Search from "./Search";

function Home() {
  const [productBySale, setProductBySale] = useState([]);
  const [productByArrival, setProductByArrival] = useState([]);
  const [error, setError] = useState(false);

  const loadProductBySell = () => {
    getProducts("sold").then((data) => {
      if (data.error) {
        setError(data.error);
      } else {
        setProductBySale(data);
      }
    });
  };

  const loadProductByArrival = () => {
    getProducts("createdAt").then((data) => {
      if (data.error) {
        setError(data.error);
      } else {
        setProductByArrival(data);
      }
    });
  };

  useEffect(() => {
    loadProductByArrival();
    loadProductBySell();
  }, []);

  return (
    <Layout
      title="Home Page"
      description="Node React E-commerce App"
      className="container-fluid"
    >
      <Search></Search>
      <h2 className="mb-4">New Arrivals</h2>
      <div className="row">
        {productByArrival.map((product, key) => (
          <Card key={key} product={product}></Card>
        ))}
      </div>

      <h2 className="mb-4">Best Sellers</h2>
      <div className="row">
        {productBySale.map((product, key) => (
          <Card key={key} product={product}></Card>
        ))}
      </div>
    </Layout>
  );
}

export default Home;
