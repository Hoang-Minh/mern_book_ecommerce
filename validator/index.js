const { validationResult, check } = require("express-validator");

const validator = [
  check("name").trim().notEmpty().withMessage("Name is required"),
  check("email")
    .trim()
    .isEmail()
    .isLength({ min: 3, max: 32 })
    .withMessage(
      "Email must be in right format and in between 3 and 32 characters"
    ),
  check("password")
    .trim()
    .notEmpty()
    .matches(/\d/)
    .isLength({ min: 6 })
    .withMessage(
      "Password must be at least 6 characters and has at least one number"
    ),
];

const result = (req, res, next) => {
  const result = validationResult(req);
  const hasError = !result.isEmpty();

  if (hasError) {
    const error = result.array()[0].msg;
    res.status(400);
    next(error);
  } else {
    next();
  }
};

module.exports = {
  validator,
  result,
};
