const { Order, CartItem } = require("../models/order");
const { errorHandler } = require("../helpers/dbErrorHandler");

exports.create = (req, res) => {
  // console.log(req.body);
  req.body.order.user = req.profile; // req.profile set in userById in controller.user.js
  const order = new Order(req.body.order);
  order.save((error, data) => {
    if (error) return res.status(400).json({ error: errorHandler });

    res.json(data);
  });
};
