const express = require("express");
const router = express.Router();
const { signup, signIn, signOut } = require("../controllers/auth");
const { validator, result } = require("../validator");

router.post("/signup", validator, result, signup);
router.post("/signin", signIn);
router.get("/signout", signOut);

module.exports = router;
