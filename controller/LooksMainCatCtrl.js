const LooksMainCat = require("../models/haveALooksMainCatModel");
const asyncHandler = require("express-async-handler");

const createCategory = asyncHandler(async (req, res) => {
  const { category } = req.body;

  // console.log(req.body);
  const existingCategory = await LooksMainCat.findOne({ category });

  if (existingCategory) {
    res.status(400);
    throw new Error("Category already exists");
  }

  const newCategory = await LooksMainCat.create({ category });

  res.status(201).json({ cat: newCategory, success: true });
});

const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await LooksMainCat.find();
  res.json(categories);
});

const getCategoryById = asyncHandler(async (req, res) => {
  const category = await LooksMainCat.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  res.json(category);
});

const updateCategory = asyncHandler(async (req, res) => {
  const { category } = req.body;

  const updatedCategory = await LooksMainCat.findByIdAndUpdate(
    req.params.id,
    { category },
    { new: true, runValidators: true }
  );

  if (!updatedCategory) {
    res.status(404);
    throw new Error("Category not found");
  }

  res.json(updatedCategory);
});

const deleteCategory = asyncHandler(async (req, res) => {
  const category = await LooksMainCat.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  await category.remove();

  res.json({ message: "Category removed" });
});

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
