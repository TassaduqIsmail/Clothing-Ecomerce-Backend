const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      // required: true,
      // unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    sold: {
      type: Number,
      default: 0,
    },
    gender: {
      type: String,
      default: "Men",
    },
    clothingStyle: {
      type: String,
      default: "Casual",
    },
    moods: {
      type: Array,
    },
    shape: {
      type: String,
      default: "Inverted",
    },
    height: {
      type: String,
      default: "170-180",
    },
    waist: {
      type: String,
      default: "25-30",
    },
    weight: {
      type: String,
      default: "70-80",
    },
    // chest: {
    //   type: String,
    //   default: "20-25",
    // },
    hip: {
      type: String,
      default: "20-25",
    },
    hipHeight: {
      type: String,
      default: "20-25",
    },
    colorsType: {
      type: String,
      default: "worm&cold",
    },
    occasions: {
      type: String,
      default: "birthday",
    },
    images: [
      {
        public_id: String,
        url: String,
      },
    ],
    isLike: { type: Boolean, default: false },
    color: [],
    tags: String,
    ratings: [
      {
        star: Number,
        comment: String,
        postedby: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
    totalrating: {
      type: String,
      default: 0,
    },
  },
  { timestamps: true }
);

//Export the model
module.exports = mongoose.model("Product", productSchema);
