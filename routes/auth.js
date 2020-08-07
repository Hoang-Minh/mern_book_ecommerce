const express = require("express");
const router = express.Router();
const { signup, signIn, signOut } = require("../controllers/auth");
const { signUpValidator, result } = require("../validator");

router.post("/signup", signUpValidator, result, signup);
router.post("/signin", signIn);
router.get("/signout", signOut);

module.exports = router;
