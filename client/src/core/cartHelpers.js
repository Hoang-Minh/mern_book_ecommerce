export const addItem = (item, next) => {
  let cart = [];
  if (typeof window !== "undefined") {
    if (localStorage.getItem("cart")) {
      cart = JSON.parse(localStorage.getItem("cart")); // convert Json to object
    }

    console.log("add item", item);

    cart.push({
      ...item,
      count: 1,
    });

    console.log(cart);

    // remove duplicates
    // build an Array from new Set and turn it back into array using Array.from
    // so that later we can re-map it
    // new set will only allow unique values in it
    // so pass the ids of each object/product
    // If the loop tries to add the same value again, it'll get ignored
    // ...with the array of ids we got on when first map() was used
    // run map() on it again and return the actual product from the cart

    cart = Array.from(new Set(cart.map((product) => product._id))).map((id) =>
      cart.find((product) => product._id === id)
    );

    console.log(cart);

    localStorage.setItem("cart", JSON.stringify(cart)); // convert object to json
    next();
  }
};

export const itemTotal = () => {
  if (typeof window !== "undefined") {
    if (localStorage.getItem("cart"))
      return JSON.parse(localStorage.getItem("cart")).length;
  }
};

export const getCart = () => {
  if (typeof window !== "undefined") {
    if (localStorage.getItem("cart"))
      return JSON.parse(localStorage.getItem("cart"));
  }

  return [];
};
