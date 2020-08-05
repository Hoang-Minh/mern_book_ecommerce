const User = require("../models/users");
const { errorHandler } = require("../helpers/dbErrorHandler");

exports.signup = (req, res, next) => {
  const user = new User(req.body);
  user.save((err, createdUser) => {
    if (err) {
      console.log("error", err);
      return res.status(400).json({ err: errorHandler(err) });
    }

    createdUser.salt = undefined;
    createdUser.hashed_password = undefined;

    res.json({ createdUser });
  });
};
