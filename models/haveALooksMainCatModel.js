const mongoose = require("mongoose");

// Declare the Schema of the Mongo model
var looksSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

//Export the model
module.exports = mongoose.model("looksMainCat", looksSchema);
