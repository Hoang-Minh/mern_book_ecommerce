const { Order } = require("../models/order");
const { errorHandler } = require("../helpers/dbErrorHandler");
const User = require("../models/users");

exports.orderById = async (req, res, next, id) => {
  try {
    const order = await Order.findById(id).populate("products.product", "name price");
    if (!order) return res.status(400).json({ error: "Order not found" });
    req.order = order;
    next();
  } catch (error) {
    return res.status(400).json({ error: errorHandler(error) });
  }
};

exports.create = async (req, res) => {
  req.body.order.user = req.profile;
  const order = new Order(req.body.order);
  try {
    const data = await order.save();
    res.json(data);
  } catch (error) {
    return res.status(400).json({ error: errorHandler(error) });
  }
};

exports.addOrderToUserHistory = async (req, res, next) => {
  const history = req.body.order.products.map((item) => ({
    _id: item._id,
    name: item.name,
    description: item.description,
    category: item.category,
    quantity: item.count,
    transaction_id: req.body.order.transaction_id,
    amount: req.body.order.amount,
  }));
  try {
    await User.findOneAndUpdate(
      { _id: req.profile._id },
      { $push: { history } },
      { new: true }
    );
    next();
  } catch (error) {
    return res
      .status(400)
      .json({ error: "Could not update user purchase history" });
  }
};

exports.listOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "_id name address")
      .sort("-createdAt");
    res.json(orders);
  } catch (error) {
    return res.status(400).json({ error: errorHandler(error) });
  }
};

exports.getStatusValue = (req, res) => {
  res.json(Order.schema.path("status").enumValues);
};

exports.updateStatusOrder = async (req, res) => {
  try {
    const order = await Order.updateOne(
      { _id: req.body.orderId },
      { $set: { status: req.body.status } }
    );
    return res.json(order);
  } catch (error) {
    return res.status(400).json({ error: errorHandler(error) });
  }
};
