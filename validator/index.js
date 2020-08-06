const { validationResult, check } = require("express-validator");

const validator = [
  check("name").trim().not().isEmpty().withMessage("Name is required"),
  check("email")
    .trim()
    .isEmail()
    .withMessage(
      "Email must be in right format and in between 3 and 32 characters"
    ),
  check("password")
    .exists()
    .withMessage("Password should not be empty")
    .isLength({ min: 6 })
    .withMessage("Password needs at least 6 characters")
    .matches(/\d/)
    .withMessage("Password must has at least one number"),
];

const result = (req, res, next) => {
  const result = validationResult(req);
  const hasError = !result.isEmpty();

  if (hasError) {
    console.log("***************************");
    console.log("result", result.array());
    console.log("result length", result.array().length);
    const error = result.array()[0].msg;
    console.log("error", error);
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
