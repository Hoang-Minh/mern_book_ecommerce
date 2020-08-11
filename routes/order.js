const express = require("express");
const router = express.Router();
const { requireSignIn, isAuth, isAdmin } = require("../controllers/auth");
const { userById } = require("../controllers/user");
const {
  create,
  addOrderToUserHistory,
  listOrders,
  getStatusValue,
  updateStatusOrder,
  orderById,
} = require("../controllers/order");
const { decreaseQuantity } = require("../controllers/product");

router.post(
  "/order/create/:userId",
  requireSignIn,
  isAuth,
  addOrderToUserHistory,
  decreaseQuantity,
  create
);

router.get("/order/list/:userId", requireSignIn, isAuth, isAdmin, listOrders);
router.get(
  "/order/status-values/:userId",
  requireSignIn,
  isAuth,
  isAdmin,
  getStatusValue
);
router.put(
  "/order/:orderId/status/:userId",
  requireSignIn,
  isAuth,
  isAdmin,
  updateStatusOrder
);

router.param("userId", userById);
router.param("orderId", orderById);

module.exports = router;
