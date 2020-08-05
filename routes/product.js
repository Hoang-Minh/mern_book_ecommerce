const express = require("express");
const router = express.Router();
const { requireSignIn, isAuth, isAdmin } = require("../controllers/auth");
const { create, read, remove } = require("../controllers/product");
const { userById } = require("../controllers/user");
const { productById } = require("../controllers/product");

router.get("/product/:productId", read);
router.post("/product/create/:userId", requireSignIn, isAuth, isAdmin, create);
router.delete(
  "/product/:productId/:userId",
  requireSignIn,
  isAuth,
  isAdmin,
  remove
);

router.param("userId", userById);
router.param("productId", productById);

module.exports = router;
