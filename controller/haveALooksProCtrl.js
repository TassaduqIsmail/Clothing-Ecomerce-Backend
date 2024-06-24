const LooksCat = require("../models/haveALookCatModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const LooksPro = require("../models/haveALooksModel");
const MainCat = require("../models/haveALooksMainCatModel");
const BasicInfoModel = require("../models/userBasicInfoModel");
const seedrandom = require("seedrandom");
const Product = require("../models/productModel");

const createCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { subCat } = req.body; // Assuming you are getting the subcategory name from the request body
  validateMongoDbId(id);
  try {
    let mainCategory = await MainCat.findById(id);

    if (!mainCategory) {
      return res
        .status(404)
        .json({ success: false, error: "Main Category not found" });
    }

    let existingSubCategory = await LooksCat.findOne({ subCategory: subCat });

    if (existingSubCategory) {
      return res.status(400).json({
        success: false,
        error: `Subcategory '${subCat}' already exists`,
      });
    }

    const newCategory = await LooksCat.create({
      category: mainCategory.category,
      subCategory: subCat,
    });
    await newCategory.save();
    res.status(201).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
});

const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const updatedCategory = await LooksCat.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updatedCategory);
  } catch (error) {
    throw new Error(error);
  }
});
// const addProductToCategory = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   const { _id } = req.body;

//   validateMongoDbId(id);

//   try {
//     // Find the category by ID
//     let category = await LooksCat.findById(id);

//     if (!category) {
//       return res
//         .status(404)
//         .json({ success: false, error: "Category not found" });
//     }

//     // Check if the product already exists in the category
//     const existingProduct = category.subCategory.products.find(
//       (product) => product.product.toString() === _id
//     );

//     if (existingProduct) {
//       return res.status(400).json({
//         success: false,
//         error: "Product already exists in the category",
//       });
//     }

//     // Find the product by its ID
//     let product = await LooksPro.findOne({ _id });

//     if (!product) {
//       return res
//         .status(404)
//         .json({ success: false, error: "Product not found" });
//     }

//     // Update the category with the new product and image
//     const updatedCategory = await LooksCat.findByIdAndUpdate(
//       id,
//       {
//         $push: {
//           products: { product: product._id },
//           images: { url: product.images[0].url },
//         },
//       },
//       { new: true }
//     ).populate("products.product");

//     res.json({ success: true, updatedCategory });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// const getAllProductsToCategory = asyncHandler(async (req, res) => {
//   const { id } = req.params;

//   try {
//     // Find the category by its ID and populate its products
//     const category = await LooksCat.findById(id).populate("products.product");

//     if (!category) {
//       return res
//         .status(404)
//         .json({ success: false, error: "Category not found" });
//     }

//     // Extract the products from the category
//     const products = category.products.map((product) => product.product);

//     res.json({ success: true, category });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

const addProductToCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { productId } = req.body;

  validateMongoDbId(id);
  validateMongoDbId(productId);

  try {
    // Find the category by ID
    let category = await LooksCat.findById(id);

    if (!category) {
      return res
        .status(404)
        .json({ success: false, error: "Category not found" });
    }

    // Check if the product already exists in the category's subcategory
    const existingProduct = category.products.find(
      (product) => product.product.toString() === productId
    );

    if (existingProduct) {
      return res.status(400).json({
        success: false,
        error: "Product already exists in the category",
      });
    }

    // Find the product by its ID
    const product = await LooksPro.findById(productId);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });
    }

    // Update the category with the new product and image
    category.products.push({ product: product._id });
    category.images.push({ url: product.images[0].url });

    await category.save();

    const updatedCategory = await LooksCat.findById(id).populate(
      "products.product"
    );

    res.json({ success: true, updatedCategory });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

function isInRange(value, range) {
  const [min, max] = range.map(Number);
  console.log(range, min, max, value);
  return value >= min && value <= max;
}

const getProductsToCategory = asyncHandler(async (req, res) => {
  const { id, _id } = req.params;

  // console.log(req.params);
  try {
    let user = await BasicInfoModel.findOne({ uid: _id });
    // console.log(user.gender);
    if (!user || !user.gender) {
      return res.status(404).json({
        success: false,
        error: "User not found or gender not specified",
      });
    }
    const allProducts = await Product.find();

    const filteredProducts = [];

    allProducts.forEach((product) => {
      if (product.gender === user.gender && product.shape === user.shape) {
        const heightRange = product.height.split("-");
        if (isInRange(user.height, heightRange)) {
          const weightRange = product.weight.split("-");
          if (isInRange(user.weight, weightRange)) {
            const waistRange = product.waist.split("-");
            if (isInRange(user.waist, waistRange)) {
              const hipHeightRange = product.hipHeight.split("-");
              if (isInRange(user.hipHeight, hipHeightRange)) {
                const hipRange = product.hip.split("-");
                if (isInRange(user.hip, hipRange)) {
                  filteredProducts.push(product);
                }
              }
            }
          }
        }
      }
    });

    if (!allProducts) {
      return res.json({ success: false, error: "product not found" });
    }
    // const products = pro.products.map((product) => product.product);

    const shuffledProducts = shuffleArray(filteredProducts);

    const selectedProduct = shuffledProducts[0];
    // console.log(selectedProduct);
    res.json(selectedProduct || []);

    // const category = await LooksCat.findOne({
    //   gender: basicInfo.gender,
    // }).populate("products.product");
    // const productsArray = await Product.find({ gender: basicInfo.gender });
    // const productsArray = await Product.find({
    //   gender: basicInfo.gender,
    //   shape: basicInfo.shape,
    // });

    // const maleProducts = productsArray.reduce((acc, product) => {
    //   console.log(product.gender);
    //   if (product.gender === "bsdk") {
    //     acc.push(product);
    //   }
    //   return acc;
    // }, []);

    // const category = await LooksCat.findById(id).populate("products.product");
    // if (!category) {
    //   return res
    //     .status(404)
    //     .json({ success: false, error: "Category not found" });
    // }
    // const products = category.products.map((product) => product.product);
    // const today = new Date();
    // const seed = today.getDate();
    // seedrandom(seed.toString(), { global: true });
    // const shuffledProducts = products.sort(() => 0.5 - Math.random());
    // const pro = shuffledProducts[0];
    // console.log(selectedProduct);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// const getAllProductsToCategory = asyncHandler(async (req, res) => {
//   const { id } = req.params;

//   try {
//     const category = await LooksCat.findById(id);

//     if (!category) {
//       return res
//         .status(404)
//         .json({ success: false, error: "Category not found" });
//     }

//     // Extract all products from subcategories
//     let allProducts = [];
//     for (const subcategory of category.subCategory) {
//       allProducts.push(...subcategory.products.map((p) => p.product));
//     }

//     // Shuffle products to get a random product
//     for (let i = allProducts.length - 1; i > 0; i--) {
//       const j = Math.floor(Math.random() * (i + 1));
//       [allProducts[i], allProducts[j]] = [allProducts[j], allProducts[i]];
//     }

//     const mostEfficientProduct = allProducts[0];

//     res.json({ success: true, mostEfficientProduct });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const deletedCategory = await LooksCat.findByIdAndDelete(id);
    res.json(deletedCategory);
  } catch (error) {
    throw new Error(error);
  }
});

const getCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const getaCategory = await LooksCat.findById(id);
    res.json(getaCategory);
  } catch (error) {
    throw new Error(error);
  }
});
// const getallCategory = asyncHandler(async (req, res) => {
//   try {
//     const getallCategory = await LooksCat.find();
//     res.json(getallCategory);
//   } catch (error) {
//     throw new Error(error);
//   }
// });

const getallCategories = asyncHandler(async (req, res) => {
  try {
    // Get all categories
    const categories = await LooksCat.find();

    // console.log(categories);
    const newsuggestionData = categories
      .filter((category) => category.category == "newsuggestion")
      .map((category) => ({
        _id: category._id,
        subCategory: category.subCategory,
        ImageUrl:
          category.images[Math.floor(Math.random() * category.images.length)]
            .url,
      }));

    const popularData = categories
      .filter((category) => category.category == "popular")
      .map((category) => ({
        _id: category._id,
        subCategory: category.subCategory,
        ImageUrl:
          category.images[Math.floor(Math.random() * category.images.length)]
            .url,
      }));

    // Create an array to store category data with random image
    // const categoriesWithRandomImage = await Promise.all(
    //   categories.map(async (category) => {
    //     let randomImageUrl = null;
    //     if (category.images && category.images.length > 0) {
    //       randomImageUrl =
    //         category.images[Math.floor(Math.random() * category.images.length)]
    //           .url;
    //     }

    //     return {
    //       category: category.category,
    //       randomImageUrl,
    //     };
    //   })
    // );

    res.json({ newsuggestionData, popularData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// const getallCategory = asyncHandler(async (req, res) => {
//   try {
//     // Get all categories
//     const categories = await LooksCat.find();

//     // Create an array to store category data with random image
//     const categoriesWithRandomImage = await Promise.all(
//       categories.map(async (category) => {
//         // Get a random image URL from the first subcategory's images array
//         let randomImageUrl = null;
//         if (
//           category.subCategory &&
//           category.subCategory.length > 0 &&
//           category.subCategory[0].images &&
//           category.subCategory[0].images.length > 0
//         ) {
//           randomImageUrl =
//             category.subCategory[0].images[
//               Math.floor(Math.random() * category.subCategory[0].images.length)
//             ].url;
//         }

//         return {
//           category: category.category,
//           randomImageUrl,
//         };
//       })
//     );

//     res.json(categoriesWithRandomImage);
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

module.exports = {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategory,
  getallCategories,
  addProductToCategory,
  getProductsToCategory,
};
