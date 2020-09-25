const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt"); // for authorization check
const User = require("../models/users");
const { errorHandler } = require("../helpers/dbErrorHandler");
const keys = require("../config/keys");

exports.signup = (req, res, next) => {
  const user = new User(req.body);
  user.save((error, createdUser) => {
    if (error) {
      console.log("error", error);
      return res.status(400).json({ error: errorHandler(error) });
    }

    createdUser.salt = undefined;
    createdUser.hashed_password = undefined;

    res.json({ createdUser });
  });
};

exports.signIn = (req, res) => {
  const { email, password } = req.body;

  User.findOne({ email }, (error, user) => {
    if (error || !user) {
      return res
        .status(400)
        .json({ error: "User with email does not exist. Please sign up" });
    }

    // user found, but password does not match
    if (!user.authenticate(password))
      return res.status(401).json({ error: "Email and password don't match" });

    // generate a signed token with user id and secret
    const token = jwt.sign({ _id: user._id }, keys.JWT_SECRET);

    // persist token as "t" in cookie with expiry date
    res.cookie("t", token, { expire: new Date() + 9999 });

    // return response with user and token to front end
    const { _id, name, email, role } = user;

    return res.json({ token, user: { _id, email, name, role } });
  });
};

exports.signOut = (req, res) => {
  res.clearCookie("t");
  res.json({ message: "Signout success" });
};

exports.requireSignIn = expressJwt({
  secret: keys.JWT_SECRET,
  algorithms: ["HS256"], // added later
  userProperty: "auth",
});

exports.isAuth = (req, res, next) => {
  const user = req.profile && req.auth && req.profile._id == req.auth._id; // req.auth coming from expressJwt package

  console.log("*******************************************");
  console.log("isAuth", user);

  if (!user) return res.status(403).json({ error: "Access denied" });
  next();
};

exports.isAdmin = (req, res, next) => {
  if (req.profile.role === 0)
    return res.status(403).json({ error: "Admin resource. Access denied" });

  console.log("*******************************************");
  console.log("isAdmin");
  next();
};
