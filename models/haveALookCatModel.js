const mongoose = require("mongoose");

// Declare the Schema of the Mongo model
var looksSchema = new mongoose.Schema(
  {
    category: { type: String, required: true },
    subCategory: { type: String, required: true },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
      },
    ],
    images: [
      {
        url: { type: String },
      },
    ],
  },
  { timestamps: true }
);

//Export the model
module.exports = mongoose.model("haveALookSubCat", looksSchema);
