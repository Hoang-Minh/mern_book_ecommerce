require("dotenv").config();
const User = require("../models/users");
const braintree = require("braintree");

const gateway = braintree.connect({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

exports.generateToken = (req, res) => {
  gateway.clientToken.generate({}, function (error, response) {
    if (error) {
      res.status(500).send(err);
    } else {
      res.send(response);
    }
  });
};
