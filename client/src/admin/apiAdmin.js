import { API } from "../config";

export const createCategory = (userId, token, category) => {
  return fetch(`${API}/category/create/${userId}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(category),
  })
    .then((response) => {
      return response.json();
    })
    .catch((err) => {
      console.log(err);
    });
};

export const createProduct = (userId, token, product) => {
  console.log(product);
  const formBody = Object.keys(product)
    .map(
      (key) => encodeURIComponent(key) + "=" + encodeURIComponent(product[key])
    )
    .join("&");

  console.log("formBody", formBody);

  return fetch(`${API}/product/create/${userId}`, {
    method: "POST",
    headers: {
      // Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      Authorization: `Bearer ${token}`,
    },
    // body: product, // since we are sending on the file - image
    body: formBody,
  })
    .then((response) => {
      return response.json();
    })
    .catch((err) => {
      console.log(err);
    });
};

export const getCategories = () => {
  return fetch(`${API}/categories`, {
    method: "GET",
  })
    .then((response) => response.json())
    .catch((error) => console.log(error));
};
