const express = require("express");
const {
  createUser,
  loginUserCtrl,
  getallUser,
  getaUser,
  deleteaUser,
  updatedUser,
  blockUser,
  unblockUser,
  handleRefreshToken,
  logout,
  updatePassword,
  forgotPasswordToken,
  resetPassword,
  loginAdmin,
  getWishlist,
  saveAddress,
  userCart,
  getUserCart,
  emptyCart,
  applyCoupon,
  createOrder,
  getOrders,
  updateOrderStatus,
  getAllOrders,
  updateProfilePic,
  saveProfileAddressStatus,
  addToCart,
  updateProductQuantity,
  removeProductFromCart,
  islikeProducts,
  createPaymentIntent,
  loginUserWithFB,
  loginUserWithGoogle,
  removeFromWishlist,
  updatedUserProfile,
  // getPaymentDetails,
  getCardDetailsByUserId,
  // SavePaymentDetials,
  addParameter,
  // StripeAttchedPayment,
  updateCalAndNotifi,
  StripeCreateCustomer,
  fcmToken,
} = require("../controller/userCtrl");
const {
  order,
  SavePaymentDetails,
  paymentSave,
} = require("../controller/paymentStripe");
// const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();
const multer = require("multer");
const storage = multer.diskStorage({});
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed!"));
    }
  },
  datauri: true,
});

router.post("/register", createUser);
router.post("/forgot-password-token", forgotPasswordToken);

router.put("/reset-password/:token", resetPassword);

router.put("/update-password/:id", updatePassword);
router.post("/login", loginUserCtrl);
router.post("/login/facebook", loginUserWithFB);
router.post("/login/google", loginUserWithGoogle);
router.post("/admin-login", loginAdmin);
router.post("/cart/:_id", userCart);
router.post("/addToCart/:id", addToCart);
router.post("/fcm_token", fcmToken);
router.post("/create_customer", StripeCreateCustomer);

router.post("/attach_payment_method/:_id", paymentSave);
router.post("/create-payment/:_id", order);
router.post("/payment-details-saved/:_id", SavePaymentDetails);
router.put("/updateProductQuantity/:id", updateProductQuantity);
router.delete("/removeProductFromCart/:id", removeProductFromCart);
router.put("/islikeProducts/:id", islikeProducts);
// router.post("/cart", userCart);
router.post("/cart/applycoupon", applyCoupon);
router.post("/cart/cash-order/:_id", createOrder);
// router.post("/create-payment/:_id", createPaymentIntent);
router.get("/all-users", getallUser);
router.get("/getallorders", getAllOrders);
router.post("/getorderbyuser/:id", getAllOrders);
router.get("/refresh", handleRefreshToken);
router.get("/logout", logout);
router.get("/get-wishlist/:_id", getWishlist);
router.get("/cart/:_id", getUserCart);
router.get("/getUserOrders/:_id", getOrders);
// router.get("/getPaymentDetails", getPaymentDetails);

router.get("/:id", getaUser);
router.post("/addPara", addParameter);
router.get("/getUserAccount/:id", getCardDetailsByUserId);
router.delete("/empty-cart/:_id", emptyCart);
router.delete("/removeFromWishlist/:_id/:protId", removeFromWishlist);
router.delete("/:id", deleteaUser);
router.put("/order/update-order/:id", updateOrderStatus);
router.put("/edit-user", updatedUser);
router.put("/save-address/:id", saveAddress);
router.put("/updateShipping-address-status/:id", saveProfileAddressStatus);
router.put("/block-user/:id", blockUser);
router.put("/unblock-user/:id", unblockUser);
router.put("/updatedUserProfile/:id", updatedUserProfile);
router.put("/updateCalNotifi/:id", updateCalAndNotifi);

router.put("/upload-profile/:id", upload.single("file"), updateProfilePic);

module.exports = router;
