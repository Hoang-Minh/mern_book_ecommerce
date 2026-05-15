const jwt = require("jsonwebtoken");
const { expressjwt } = require("express-jwt");
const User = require("../models/users");
const { errorHandler } = require("../helpers/dbErrorHandler");
const keys = require("../config/keys");

exports.signup = async (req, res) => {
  try {
    const user = new User(req.body);
    const createdUser = await user.save();
    createdUser.salt = undefined;
    createdUser.hashed_password = undefined;
    res.json({ createdUser });
  } catch (error) {
    return res.status(400).json({ error: errorHandler(error) });
  }
};

exports.signIn = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(400)
        .json({ error: "User with email does not exist. Please sign up" });

    if (!user.authenticate(password))
      return res.status(401).json({ error: "Email and password don't match" });

    const token = jwt.sign({ _id: user._id }, keys.JWT_SECRET);
    res.cookie("t", token, { expire: new Date() + 9999 });

    const { _id, name, email: userEmail, role } = user;
    return res.json({ token, user: { _id, email: userEmail, name, role } });
  } catch (error) {
    return res.status(400).json({ error: "Error signing in" });
  }
};

exports.signOut = (req, res) => {
  res.clearCookie("t");
  res.json({ message: "Signout success" });
};

exports.requireSignIn = expressjwt({
  secret: keys.JWT_SECRET,
  algorithms: ["HS256"],
  userProperty: "auth",
});

exports.isAuth = (req, res, next) => {
  const user = req.profile && req.auth && req.profile._id == req.auth._id;
  if (!user) return res.status(403).json({ error: "Access denied" });
  next();
};

exports.isAdmin = (req, res, next) => {
  if (req.profile.role === 0)
    return res.status(403).json({ error: "Admin resource. Access denied" });
  next();
};
