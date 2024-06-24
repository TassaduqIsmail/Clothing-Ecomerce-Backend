const Product = require("../models/productModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const validateMongoDbId = require("../utils/validateMongodbId");
const colorModel = require("../models/colorModel");

const createProduct = asyncHandler(async (req, res) => {
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    const newProduct = await Product.create(req.body);
    res.json(newProduct);
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
});

const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  // console.log(req.body);
  try {
    const updateFields = req.body;
    if (updateFields.title) {
      updateFields.slug = slugify(updateFields.title);
    }
    const updateProduct = await Product.findOneAndUpdate(
      { _id: id },
      updateFields,
      {
        new: true,
      }
    );

    if (!updateProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(updateProduct);
  } catch (error) {
    // console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  console.log(id);
  try {
    const deletedProduct = await Product.findOneAndDelete({ _id: id });
    res.json(deletedProduct);
  } catch (error) {
    throw new Error(error);
  }
});

const getaProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const findProduct = await Product.findById(id);

    res.json(findProduct);
  } catch (error) {
    throw new Error(error);
  }
});
const filterByMoods = asyncHandler(async (req, res) => {
  const { attributes } = req.body;
  // console.log(attributes);
  try {
    const filteredProducts = await Product.find({ moods: { $in: attributes } });
    res.json(filteredProducts);
  } catch (error) {
    res.status(500).send("Error filtering products");
  }
});

const getAllProduct = asyncHandler(async (req, res) => {
  try {
    // Filtering
    const queryObj = { ...req.query };
    const excludeFields = ["page", "sort", "limit", "fields"];
    excludeFields.forEach((el) => delete queryObj[el]);
    // console.log(excludeFields);
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let query = Product.find(JSON.parse(queryStr));

    // Sorting

    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    // limiting the fields

    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v");
    }

    // pagination

    const page = req.query.page;
    const limit = req.query.limit;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
    if (req.query.page) {
      const productCount = await Product.countDocuments();
      if (skip >= productCount) throw new Error("This Page does not exists");
    }
    const products = await query;

    const colorPromises = [];

    // Extract color IDs from all products
    const colorIds = products.reduce((acc, curr) => {
      acc.push(...curr.color);
      return acc;
    }, []);

    // Fetch color data for each color ID
    for (const colorId of colorIds) {
      const promise = colorModel.findById(colorId); // Assuming you have a method findById in your Color model
      colorPromises.push(promise);
    }

    // Wait for all color data promises to resolve
    const colors = await Promise.all(colorPromises);

    // Map through products and update color IDs with color codes
    const updatedProducts = products.map((product) => {
      const updatedColors = product.color.map((colorId) => {
        const color = colors.find(
          (c) => c._id.toString() === colorId.toString()
        );
        return color ? color.title : null; // Assuming 'code' is the property containing color code
      });
      return { ...product.toObject(), color: updatedColors };
    });

    // console.log(updatedProducts);
    res.json(updatedProducts);
  } catch (error) {
    throw new Error(error);
  }
});

const addToWishlist = asyncHandler(async (req, res) => {
  const { _id } = req.params;
  const { prodId } = req.body;

  try {
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the product is already in the wishlist
    const alreadyAdded = user.wishlist.some(
      (id) => id.toString() === prodId.toString()
    );

    let updatedUser;
    if (alreadyAdded) {
      // If already added, remove it from the wishlist
      updatedUser = await User.findByIdAndUpdate(
        _id,
        { $pull: { wishlist: prodId } },
        { new: true }
      );
      // Update the isLike status of the product to false
      // await Product.findByIdAndUpdate(prodId, { isLike: false });
    } else {
      // If not added, add it to the wishlist
      updatedUser = await User.findByIdAndUpdate(
        _id,
        { $push: { wishlist: prodId } },
        { new: true }
      );
      // Update the isLike status of the product to true
      // await Product.findByIdAndUpdate(prodId, { isLike: true });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const rating = asyncHandler(async (req, res) => {
  const { _id } = req.params;
  const { star, prodId, comment } = req.body;
  console.log(req.body);
  try {
    const product = await Product.findById(prodId);
    let alreadyRated = product.ratings.find(
      (userId) => userId.postedby.toString() === _id.toString()
    );
    if (alreadyRated) {
      const updateRating = await Product.updateOne(
        {
          ratings: { $elemMatch: alreadyRated },
        },
        {
          $set: { "ratings.$.star": star, "ratings.$.comment": comment },
        },
        {
          new: true,
        }
      );
    } else {
      const rateProduct = await Product.findByIdAndUpdate(
        prodId,
        {
          $push: {
            ratings: {
              star: star,
              comment: comment,
              postedby: _id,
            },
          },
        },
        {
          new: true,
        }
      );
    }
    const getallratings = await Product.findById(prodId);
    let totalRating = getallratings.ratings.length;
    let ratingsum = getallratings.ratings
      .map((item) => item.star)
      .reduce((prev, curr) => prev + curr, 0);
    // console.log(ratingsum);
    let actualRating = ratingsum / totalRating;
    let finalproduct = await Product.findByIdAndUpdate(
      prodId,
      {
        totalrating: actualRating.toFixed(2),
      },
      { new: true }
    );
    res.json(finalproduct);
  } catch (error) {
    throw new Error(error);
  }
});

// Define a function to get a random value from the given options
// function getRandomValue() {
//   const options = [23, 35, 56, 40, 50, 30];
//   // const options = ["Inverted", "Rectangle", "Hour", "Round", "Triangle"];
//   const randomIndex = Math.floor(Math.random() * options.length);
//   return options[randomIndex];
// }

// Define a route to update all documents with a new parameter
// const addParameter = asyncHandler(async (req, res) => {
//   try {
//     // Define the update object with the new parameter
//     // const updateObject = {
//     //   $set: {
//     //     shape: getRandomValue(),
//     //   },
//     // };

//     const products = await Product.find({});

//     // Loop through each product and update its shape parameter with a random value
//     for (const product of products) {
//       console.log(getRandomValue());

//       product.price = getRandomValue();
//       await product.save();
//     }

//     // Update all documents in the Product collection
//     // await Product.updateMany({}, updateObject);

//     res.status(200).json({
//       success: true,
//       message: "All products updated successfully with the new parameter.",
//     });
//   } catch (error) {
//     console.error("Error updating products:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error.",
//     });
//   }
// });

const addParameter = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find({});

    // Define ranges for each parameter
    const occasions = [
      "birthday",
      "party",
      "wedding",
      "anniversary",
      "graduation",
      "baby shower",
      "housewarming",
      "engagement",
      "retirement",
      "funeral",
      "christmas",
      "new year",
      "thanksgiving",
      "halloween",
      "easter",
      "valentine's day",
      "independence day",
      "mother's day",
      "father's day",
      "hanukkah",
      "other",
    ];

    // const type = ["worm&cold", "neutral", "highlight", "monochrome"];
    // const chestRanges = ["30-35", "20-25", "25-30", "35-40", "40-45"];
    // const heightRanges = [
    //   "160-170",
    //   "170-180",
    //   "180-190",
    //   "150-160",
    //   "190-200",
    // ];
    // const waistRanges = ["20-25", "25-30", "30-35", "35-40", "40-45"];
    // const weightRanges = [
    //   "40-50",
    //   "50-60",
    //   "60-70",
    //   "70-80",
    //   "80-90",
    //   "90-100",
    // ];

    // Loop through each product and update its parameters with random measurements
    for (const product of products) {
      product.occasions = getRandomMeasurementFromRange(occasions);
      // product.height = getRandomMeasurementFromRange(heightRanges);
      // product.waist = getRandomMeasurementFromRange(waistRanges);
      // product.weight = getRandomMeasurementFromRange(weightRanges);

      await product.save();
    }

    res.status(200).json({
      success: true,
      message:
        "All products updated successfully with random human measurements.",
    });
  } catch (error) {
    console.error("Error updating products:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
});

// Function to generate a random measurement from a range
function getRandomMeasurementFromRange(rangeArray) {
  const selectedRange =
    rangeArray[Math.floor(Math.random() * rangeArray.length)];
  return selectedRange;
  // const [min, max] = selectedRange.split("-").map(Number);
  // return Math.floor(Math.random() * (max - min + 1)) + min + "-" + max;
}

module.exports = {
  createProduct,
  getaProduct,
  getAllProduct,
  updateProduct,
  deleteProduct,
  addToWishlist,
  rating,
  addParameter,
  filterByMoods,
};
