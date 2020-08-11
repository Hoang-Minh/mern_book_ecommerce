const { Order, CartItem } = require("../models/order");
const { errorHandler } = require("../helpers/dbErrorHandler");
const User = require("../models/users");

exports.orderById = (req, res, next, id) => {
  Order.findById(id)
    .populate("products.product", "name price")
    .exec((error, order) => {
      if (error || !order) return res.status(400).json({ error: errorHandler });

      req.order = order;
      next();
    });
};

exports.create = (req, res) => {
  // console.log(req.body);
  req.body.order.user = req.profile; // req.profile set in userById in controller.user.js
  const order = new Order(req.body.order);
  order.save((error, data) => {
    if (error) return res.status(400).json({ error: errorHandler });

    res.json(data);
  });
};

exports.addOrderToUserHistory = (req, res, next) => {
  const history = [];
  req.body.order.products.forEach((item) => {
    history.push({
      _id: item._id,
      name: item.name,
      description: item.description,
      category: item.category,
      quantity: item.count,
      transaction_id: req.body.order.transaction_id,
      amount: req.body.order.amount,
    });
  });

  User.findOneAndUpdate(
    { _id: req.profile._id },
    { $push: { history: history } },
    { new: true },
    (error, data) => {
      if (error)
        return res
          .status(400)
          .json({ error: "Could not update user purchase history" });

      next();
    }
  );
};

exports.listOrders = (req, res) => {
  Order.find()
    .populate("user", "_id name address")
    .sort("-created")
    .exec((error, orders) => {
      console.log(error);
      if (error) {
        return res.status(400).json({
          error: errorHandler(error),
        });
      }
      res.json(orders);
    });
};

exports.getStatusValue = (req, res) => {
  res.json(Order.schema.path("status").enumValues);
};

exports.updateStatusOrder = (req, res) => {
  Order.update(
    { _id: req.body.orderId },
    { $set: { status: req.body.status } },
    (error, order) => {
      if (error) return res.status(400).json({ error: errorHandler });

      return res.json(order);
    }
  );
};
