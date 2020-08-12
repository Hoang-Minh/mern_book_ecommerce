export const createCategory = (userId, token, category) => {
  return fetch(`/api/category/create/${userId}`, {
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
  return fetch(`/api/product/create/${userId}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      // "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      Authorization: `Bearer ${token}`,
    },
    // body: qs.stringify(product),
    body: product,
  })
    .then((response) => {
      return response.json();
    })
    .catch((err) => {
      console.log(err);
    });
};

export const getCategories = () => {
  return fetch("/api/categories", {
    method: "GET",
  })
    .then((response) => response.json())
    .catch((error) => console.log(error));
};

export const listOrders = (userId, token) => {
  return fetch(`/api/order/list/${userId}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .catch((error) => console.log(error));
};

export const getStatusValues = (userId, token) => {
  return fetch(`/api/order/status-values/${userId}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .catch((error) => console.log(error));
};

export const updateOrderStatus = (userId, token, orderId, status) => {
  return fetch(`/api/order/${orderId}/status/${userId}`, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status, orderId }),
  })
    .then((response) => response.json())
    .catch((error) => console.log(error));
};

// get all products
// get a single product
// update a single product
// delete single product
export const getProducts = () => {
  return fetch(`/api/products?limit=undefine`, {
    method: "GET",
  })
    .then((response) => response.json())
    .catch((error) => console.log(error));
};

export const deleteProduct = (productId, userId, token) => {
  return fetch(`/api/products/${productId}/${userId}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .catch((error) => console.log(error));
};

export const getProduct = (productId) => {
  return fetch(`/api/product/${productId}`, {
    method: "GET",
  })
    .then((response) => response.json())
    .catch((error) => console.log(error));
};

export const updateProduct = (productId, userId, token, product) => {
  return fetch(`/api/product/${productId}/${userId}`, {
    method: "PUT",
    headers: {
      Accept: "application/json",

      Authorization: `Bearer ${token}`,
    },
    body: product, // do not stringify cuz we are going to use form data
  })
    .then((response) => response.json())
    .catch((error) => console.log(error));
};
