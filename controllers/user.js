const User = require("../models/users");

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
