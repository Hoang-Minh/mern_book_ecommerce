const User = require("../models/users");
const { Order } = require("../models/order");
const { errorHandler } = require("../helpers/dbErrorHandler");

exports.userById = async (req, res, next, id) => {
  try {
    const user = await User.findById(id);
    if (!user) return res.status(400).json({ error: "User not found" });
    req.profile = user;
    next();
  } catch (error) {
    return res.status(400).json({ error: "User not found" });
  }
};

exports.read = (req, res) => {
  req.profile.hashed_password = undefined;
  req.profile.salt = undefined;
  return res.json(req.profile);
};

exports.update = async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.profile._id },
      { $set: req.body },
      { new: true }
    );
    user.hashed_password = undefined;
    user.salt = undefined;
    res.json(user);
  } catch (error) {
    return res
      .status(400)
      .json({ error: "You are not authorized to perform this action" });
  }
};

exports.purchaseHistory = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.profile._id })
      .populate("user", "_id name")
      .sort("-createdAt");
    res.json(orders);
  } catch (error) {
    return res.status(400).json({ error: errorHandler(error) });
  }
};
