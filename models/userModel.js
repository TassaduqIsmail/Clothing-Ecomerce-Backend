const mongoose = require("mongoose"); // Erase if already required
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { type } = require("os");
// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    loginWith: {
      type: String,
      default: "email",
    },
    facebookId: {
      type: String,
    },
    googleId: {
      type: String,
    },
    fullName: {
      type: String,
      default: "",
      // required: true,
    },
    // lasName: {
    // type: String,
    // required: true,
    // },
    email: {
      type: String,
      required: true,
      unique: true,
    },

    profilePic: {
      url: String,
      asset_id: String,
      public_id: String,
    },

    // mobile: {
    //   type: String,
    //   required: true,
    //   unique: true,
    // },
    password: {
      type: String,
      // required: true,
    },
    role: {
      type: String,
      default: "user",
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    cart: {
      type: Array,
      default: [],
    },
    isBasicInfo: {
      type: Boolean,
      default: false,
    },
    isAccountStatus: {
      type: Boolean,
      default: false,
    },
    isSyncCalender: {
      type: Boolean,
      default: false,
    },
    isNotification: {
      type: Boolean,
      default: false,
    },
    fcmToken: {
      type: String,
      default: "",
    },

    BillingAddress: {
      contactNo: { type: String, default: "" },
      address: { type: String, default: "" },
      country: { type: String, default: "" },
      state: { type: String, default: "" },
      zipCode: { type: Number, default: "" },
      isdefault: { Boolean, default: false },
    },
    shippingAddress: {
      address: { type: String, default: "" },
      country: { type: String, default: "" },
      state: { type: String, default: "" },
      zipCode: { type: String, default: "" },
      isdefault: { Boolean, default: false },
    },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    refreshToken: {
      type: String,
    },

    verificationCode: Number,
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    verificationCodeExpiration: Date,
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSaltSync(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
userSchema.methods.isPasswordMatched = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
userSchema.methods.createPasswordResetToken = async function () {
  const resettoken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resettoken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 30 * 60 * 1000; // 10 minutes
  return resettoken;
};

//Export the model
module.exports = mongoose.model("User", userSchema);
