import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { isAuthenticated } from "../auth";
import { getBraintreeClientToken, processPayment } from "./apiCore";
import DropIn from "braintree-web-drop-in-react";
import { emptyCart } from "./cartHelpers";

function Checkout({ products, setRun = (f) => f, run = undefined }) {
  const [data, setData] = useState({
    loading: false,
    success: false,
    clientToken: null,
    error: "",
    instance: {},
    address: "",
  });

  const userId = isAuthenticated() && isAuthenticated().user._id;
  const token = isAuthenticated() && isAuthenticated().token;

  const getToken = (userId, token) => {
    getBraintreeClientToken(userId, token).then((data) => {
      if (data.error) {
        setData({ ...data, error: data.error });
      } else {
        setData({ clientToken: data.clientToken });
      }
    });
  };

  useEffect(() => {
    getToken(userId, token);
  }, []);

  const getTotal = () => {
    return products.reduce((currentValue, nextValue) => {
      return currentValue + nextValue.count * nextValue.price;
    }, 0);
  };

  const showCheckout = () => {
    return isAuthenticated() ? (
      <div>{showDropIn()}</div>
    ) : (
      <Link to="/signin">
        <button className="btn btn-primary">Sign in to checkout</button>
      </Link>
    );
  };

  const buy = () => {
    setData({ loading: true });
    // send he nonce = data.instance.requestPaymentMethod() to server;
    let nonce;
    data.instance
      .requestPaymentMethod()
      .then((data) => {
        console.log(data);
        nonce = data.nonce;

        //once you have nounce (card type, card number...) send nounce as paymentMethodNounce to server
        // and also total to be charged
        // console.log(
        //   "send nonce and total to process",
        //   nonce,
        //   getTotal(products)
        // );

        const paymentData = {
          paymentMethodNonce: nonce,
          amount: getTotal(products),
        };

        processPayment(userId, token, paymentData)
          .then((response) => {
            //console.log(response)
            setData({ ...data, success: response.success });

            emptyCart(() => {
              console.log("empty cart");
              setRun(!run); // run useEffect in parent Cart
              setData({ loading: false });
            });

            // empty cart
            //create order
          })
          .catch((error) => {
            console.log(error);
            setData({ loading: false });
          });
      })
      .catch((error) => {
        //console.log("dropping error", error);
        setData({ ...data, error: error.message });
      });
  };

  const showError = (error) => (
    <div
      className="alert alert-danger"
      style={{ display: error ? "" : "none" }}
    >
      {error}
    </div>
  );

  const showSuccess = (success) => (
    <div
      className="alert alert-info"
      style={{ display: success ? "" : "none" }}
    >
      Thanks for your payment.
    </div>
  );

  const showLoading = (loading) => loading && <h2>Loading...</h2>;

  const showDropIn = () => (
    <div onBlur={() => setData({ ...data, error: "" })}>
      {data.clientToken !== null && products.length > 0 ? (
        <div>
          <DropIn
            options={{
              authorization: data.clientToken,
              paypal: { flow: "vault" },
              paypalCredit: { flow: "vault" },
            }}
            onInstance={(instance) => (data.instance = instance)}
          ></DropIn>
          <button onClick={buy} className="btn btn-success btn-block">
            Pay
          </button>
        </div>
      ) : null}
    </div>
  );

  return (
    <div>
      <h2>Total: ${getTotal()}</h2>
      {showLoading(data.loading)}
      {showSuccess(data.success)}
      {showError(data.error)}
      {showCheckout()}
    </div>
  );
}

export default Checkout;
