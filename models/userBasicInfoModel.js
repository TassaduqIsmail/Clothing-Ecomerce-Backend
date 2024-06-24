const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  uid: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  gender: String,
  height: Number,
  weight: Number,
  chest: Number,
  hip: Number,
  shape: String,
  waist: String,
  hipHeight: String,
  bodyImage: {
    url: String,
    asset_id: String,
    public_id: String,
  },
  style: {
    styleRange: { type: Number },
    styleName: { type: String },
    isLiked: { type: Boolean, default: false },
    isDislike: { type: Boolean, default: false },
  },
  styleGuidelines: {
    brands: [String],
    tshirtSize: String,
    pantsSize: String,
    coatsSize: String,
  },
  isEcoFriendly: { type: Boolean, default: false },
});

module.exports = mongoose.model("BasicInfo", userSchema);
