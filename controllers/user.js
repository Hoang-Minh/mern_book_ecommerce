const User = require("../models/users");
const { Order } = require("../models/order");
const { errorHandler } = require("../helpers/dbErrorHandler");

exports.userById = (req, res, next, id) => {
  User.findById(id).exec((error, user) => {
    if (error || !user) {
      return res.status(400).json({ error: "User not found" });
    }

    req.profile = user;
    next();
  });
};

exports.read = (req, res) => {
  req.profile.hased_password = undefined;
  req.profile.salt = undefined;

  return res.json(req.profile);
};

exports.update = (req, res) => {
  User.findOneAndUpdate(
    { _id: req.profile._id },
    { $set: req.body },
    { new: true },
    (error, user) => {
      if (error)
        return res
          .status(400)
          .json({ error: "You are not authorized to perform this action" });

      req.profile.hased_password = undefined;
      req.profile.salt = undefined;
      res.json(user);
    }
  );
};

exports.purchaseHistory = (req, res) => {
  console.log("purchase history", req.profile._id);
  Order.find({ user: req.profile._id })
    .populate("user", "_id name")
    .sort("-created")
    .exec((error, orders) => {
      if (error) return res.status(400).json({ error: errorHandler });

      res.json(orders);
    });
};
