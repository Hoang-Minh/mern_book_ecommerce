const braintree = require("braintree");
const keys = require("../config/keys");

const gateway = braintree.connect({
  environment: braintree.Environment.Sandbox,
  merchantId: keys.BRAINTREE_MERCHANT_ID,
  publicKey: keys.BRAINTREE_PUBLIC_KEY,
  privateKey: keys.BRAINTREE_PRIVATE_KEY,
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

exports.processPayment = (req, res) => {
  const nonceFromTheClient = req.body.paymentMethodNonce; //payment method
  const amountFromTheClient = req.body.amount;

  // charge
  const newTransaction = gateway.transaction.sale(
    {
      amount: amountFromTheClient,
      paymentMethodNonce: nonceFromTheClient,
      options: {
        submitForSettlement: true,
      },
    },
    (error, result) => {
      if (error) return res.status(500).json(error);

      res.json(result);
    }
  );
};
