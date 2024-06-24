const express = require("express");
const {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategory,
  getallCategories,
  addProductToCategory,
  getProductsToCategory,
} = require("../controller/haveALooksProCtrl");
// const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/create/:id", createCategory);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);
router.get("/:id", getCategory);
router.get("/", getallCategories);
router.put("/addPro/:id", addProductToCategory);
router.get("/getPro/:_id", getProductsToCategory);

module.exports = router;
