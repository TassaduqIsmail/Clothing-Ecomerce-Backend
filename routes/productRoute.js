const express = require("express");
const {
  createProduct,
  getaProduct,
  getAllProduct,
  updateProduct,
  deleteProduct,
  addToWishlist,
  rating,
  addParameter,
  filterByMoods
} = require("../controller/productCtrl");
// const { isAdmin, authMiddleware } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/", createProduct);

router.get("/getAProduct/:id", getaProduct);
router.put("/wishlist/:_id", addToWishlist);
router.put("/rating/:_id", rating);

router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

router.get("/", getAllProduct);
router.post("/filterByMoods", filterByMoods);
router.get("/addPara", addParameter);

module.exports = router;
