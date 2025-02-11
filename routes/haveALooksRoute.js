const express = require("express");
const {
  createProduct,
  getaProduct,
  getAllProduct,
  updateProduct,
  deleteProduct,
  addToWishlist,
  rating,
} = require("../controller/haveALooksCtrl");
// const { isAdmin, authMiddleware } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/", createProduct);

router.get("/getAproduct/:id", getaProduct);
router.put("/wishlist", addToWishlist);
router.put("/rating", rating);

router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

router.get("/", getAllProduct);

module.exports = router;
