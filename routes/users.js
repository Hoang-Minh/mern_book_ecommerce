const express = require("express");
const router = express.Router();
const { signup } = require("../controllers/users");
const { validator, result } = require("../validator");

router.post("/signup", validator, result, signup);

module.exports = router;
