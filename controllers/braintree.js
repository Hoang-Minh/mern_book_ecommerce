const braintree = require("braintree");
const keys = require("../config/keys");

const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: keys.BRAINTREE_MERCHANT_ID,
  publicKey: keys.BRAINTREE_PUBLIC_KEY,
  privateKey: keys.BRAINTREE_PRIVATE_KEY,
});

exports.generateToken = (req, res) => {
  gateway.clientToken.generate({}, function (error, response) {
    if (error) {
      res.status(500).send(error);
    } else {
      res.send(response);
    }
  });
};

exports.processPayment = (req, res) => {
  const nonceFromTheClient = req.body.paymentMethodNonce;
  const amountFromTheClient = req.body.amount;

  gateway.transaction.sale(
    {
      amount: amountFromTheClient,
      paymentMethodNonce: nonceFromTheClient,
      options: { submitForSettlement: true },
    },
    (error, result) => {
      if (error) return res.status(500).json(error);
      res.json(result);
    }
  );
};
