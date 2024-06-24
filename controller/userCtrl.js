const User = require("../models/userModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const Coupon = require("../models/couponModel");
const Order = require("../models/orderModel");
const uniqid = require("uniqid");
const dotenv = require("dotenv").config();
const bcrypt = require("bcrypt");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const admin = require("../config/firebaseAuth");

const asyncHandler = require("express-async-handler");
const { generateToken } = require("../config/jwtToken");
const validateMongoDbId = require("../utils/validateMongodbId");
const { generateRefreshToken } = require("../config/refreshtoken");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { log } = require("console");
const { sendVerificationEmail, orderEmail } = require("./emailCtrl");
const {
  cloudinaryUploadImg,
  cloudinaryImageUpdater,
} = require("../utils/cloudinary");
const Card = require("../models/cardDetails");
const sendNotification = require("../config/notificationSend");

// Create a User ----------------------------------------------

const createUser = asyncHandler(async (req, res) => {
  console.log(req.body);
  // const email = req.body.email;
  const { email, ...userData } = req.body;
  // console.log("email", email);

  const findUser = await User.findOne({ email: email });

  if (!findUser) {
    const newUser = await User.create({
      ...userData,
      email,
      profilePic: {
        url: "",
        asset_id: "",
        public_id: "",
      },
    });
    res.json({ success: true, user: newUser });
  } else {
    /**
     * TODO:if user found then thow an error: User already exists
     */
    throw new Error("User Already Exists");
  }
});
const fcmToken = asyncHandler(async (req, res) => {
  const { token, email } = req.body;

  // console.log("email", token, email);
  // console.log("email", token, email);

  const findUser = await User.findOne({ email });

  if (!findUser) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  // User found, update the token
  findUser.fcmToken = token;
  await findUser.save();

  res.json({
    success: true,
    message: "Token updated successfully",
    user: findUser,
  });
});

// Login a user
const loginUserCtrl = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // check if user exists or not

  const findUser = await User.findOne({ email });
  if (findUser && (await findUser.isPasswordMatched(password))) {
    const refreshToken = await generateRefreshToken(findUser?._id);
    const updateuser = await User.findByIdAndUpdate(
      findUser.id,
      {
        refreshToken: refreshToken,
      },
      { new: true }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });

    if (findUser?.fcmToken) {
      const token = findUser?.fcmToken;
      const noti = {
        title: "Login",
        body: "You have login successfully",
      };
      sendNotification(token, noti);
    }
    // console.log("findUser?.isBasicInfo", findUser?.isBasicInfo);
    res.json({
      _id: findUser?._id,
      success: true,
      isBasicInfo: findUser?.isBasicInfo,
      email: findUser?.email,
      status: findUser?.isAccountStatus,
      name: findUser?.fullName,
      token: generateToken(findUser?._id),
    });
  } else {
    throw new Error("Invalid Credentials");
  }
});

// const token =
//   "fKKH3myyTV6U968Rf1371t:APA91bElcfhzEZHTs_QhCvfMRyZHxZnQQRrJ3tAE59vjM0QfwrizMkrRzVB2hv-by-IUfDDxRGdxSGMHytWLpl6wGKpLUdXtsMhve6O7AcfcNUR5lx6K8VI9pxo6O5RcPQnclcYGZt8z";
// sendNotification(token);

const loginUserWithFB = asyncHandler(async (req, res) => {
  const { facebookId, email, fullName, loginWith, username } = req.body;
  const findUser = await User.findOne({ email });

  if (!findUser) {
    // If user doesn't exist, create a new user record
    const newUser = await User.create({
      facebookId: facebookId,
      email: email,
      fullName: fullName,
      loginWith: loginWith,
      username: username,
      profilePic: {
        url: "",
        asset_id: "",
        public_id: "",
      },
    });
    await newUser.save();
  } else {
    if (findUser) {
      const refreshToken = await generateRefreshToken(findUser?._id);
      const updateuser = await User.findByIdAndUpdate(
        findUser.id,
        {
          refreshToken: refreshToken,
        },
        { new: true }
      );
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 72 * 60 * 60 * 1000,
      });

      if (findUser?.fcmToken) {
        const token = findUser?.fcmToken;
        const noti = {
          title: "Login",
          body: "You have login successfully",
        };
        sendNotification(token, noti);
      }

      res.json({
        _id: findUser?._id,
        success: true,
        isBasicInfo: findUser?.isBasicInfo,
        email: findUser?.email,
        status: findUser?.isAccountStatus,
        name: findUser?.fullName,
        token: generateToken(findUser?._id),
      });
    } else {
      throw new Error("Invalid Credentials");
    }
  }
});
const loginUserWithGoogle = asyncHandler(async (req, res) => {
  const { googleId, email, fullName, loginWith, username } = req.body;
  // console.log(req.body);

  const findUser = await User.findOne({ email });

  if (!findUser) {
    // If user doesn't exist, create a new user record
    const newUser = await User.create({
      googleId: googleId,
      email: email,
      fullName: fullName,
      loginWith: loginWith,
      username: username,
      profilePic: {
        url: "",
        asset_id: "",
        public_id: "",
      },
    });
    await newUser.save();
  } else {
    if (findUser) {
      const refreshToken = await generateRefreshToken(findUser?._id);
      const updateuser = await User.findByIdAndUpdate(
        findUser.id,
        {
          refreshToken: refreshToken,
        },
        { new: true }
      );
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 72 * 60 * 60 * 1000,
      });

      if (findUser?.fcmToken) {
        const token = findUser?.fcmToken;
        const noti = {
          title: "Login",
          body: "You have login successfully",
        };
        sendNotification(token, noti);
      }
      res.json({
        _id: findUser?._id,
        success: true,
        isBasicInfo: findUser?.isBasicInfo,
        email: findUser?.email,
        status: findUser?.isAccountStatus,
        name: findUser?.fullName,
        token: generateToken(findUser?._id),
      });
    } else {
      throw new Error("Invalid Credentials");
    }
  }
});

// admin login

const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // check if user exists or not
  const findAdmin = await User.findOne({ email });

  // console.log(findAdmin);
  console.log(await findAdmin.isPasswordMatched(password));

  if (findAdmin.role !== "admin") throw new Error("Not Authorised");
  if (findAdmin && (await findAdmin.isPasswordMatched(password))) {
    // console.log('ander a raha hn ');
    const refreshToken = await generateRefreshToken(findAdmin?._id);
    // console.log('refresh token ',refreshToken);
    const updateuser = await User.findByIdAndUpdate(
      findAdmin?._id,
      {
        refreshToken: refreshToken,
      },
      { new: true }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });
    res.json({
      _id: findAdmin?._id,
      firstname: findAdmin?.firstname,
      lastname: findAdmin?.lastname,
      email: findAdmin?.email,
      mobile: findAdmin?.mobile,
      token: generateToken(findAdmin?._id),
    });
  } else {
    throw new Error("Invalid Credentials");
  }
});

// handle refresh token

const handleRefreshToken = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) throw new Error(" No Refresh token present in db or not matched");
  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err || user.id !== decoded.id) {
      throw new Error("There is something wrong with refresh token");
    }
    const accessToken = generateToken(user?._id);
    res.json({ accessToken });
  });
});

// logout functionality

const logout = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    });
    return res.sendStatus(204); // forbidden
  }
  await User.findOneAndUpdate(refreshToken, {
    refreshToken: "",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
  });
  res.sendStatus(204); // forbidden
});

// Update a user

const updatedUser = asyncHandler(async (req, res) => {
  const { id } = req.body;
  validateMongoDbId(id);
  // console.log("=========================>", req.body);
  try {
    const user = await User.findById(id);

    const updatedUser = await User.findByIdAndUpdate(
      { _id: id.id },
      {
        isAccountStatus: req?.body?.id.status,
        // lastname: req?.body?.lastname,
        // email: req?.body?.email,
        // mobile: req?.body?.mobile,
      },
      {
        new: true,
      }
    );
    if (user?.isNotification) {
      const token = user?.fcmToken;
      const noti = {
        title: "Admin Blocked",
        body: "Admin blocked your account",
      };
      sendNotification(token, noti);
    }

    res.json(updatedUser);
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
});
const updatedUserProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userData } = req.body;
  console.log(id, userData);
  validateMongoDbId(id);
  // console.log("=========================>", req.body);
  try {
    const user = await User.findById(id);
    if (userData?.password) {
      // Hash the new password before updating
      const salt = await bcrypt.genSalt(10);
      userData.password = await bcrypt.hash(userData.password, salt);
    }
    const updatedUser = await User.findByIdAndUpdate(
      { _id: id },
      {
        ...userData,
      },
      {
        new: true,
      }
    );
    if (user?.isNotification) {
      const token = user?.fcmToken;
      const noti = {
        title: "Profile Updated",
        body: "Successfully Updated profile",
      };
      sendNotification(token, noti);
    }
    res.json(updatedUser);
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
});

// save user Address

const saveAddress = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { BillingAddress, shippingAddress } = req.body;

  console.log(BillingAddress?.contactNo, shippingAddress);
  console.log(id);
  validateMongoDbId(id);

  try {
    const user = await User.findById(id);

    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        shippingAddress: {
          // contactNo: shippingAddress?.contactNo,
          address: shippingAddress?.address,
          country: shippingAddress?.country,
          state: shippingAddress?.state,
          zipCode: shippingAddress?.zipCode,
          isdefault: shippingAddress?.isdefault,
        },
        BillingAddress: {
          contactNo: BillingAddress?.contactNo,
          address: BillingAddress?.address,
          country: BillingAddress?.country,
          state: BillingAddress?.state,
          zipCode: BillingAddress?.zipCode,
          isdefault: BillingAddress?.isdefault,
        },
      },
      {
        new: true,
      }
    );

    if (user?.isNotification) {
      const token = user?.fcmToken;
      const noti = {
        title: "Address Updated",
        body: "Successfully Updated Address",
      };
      sendNotification(token, noti);
    }
    res.json(updatedUser);
  } catch (error) {
    throw new Error(error);
  }
});

const saveProfileAddressStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isdefault } = req.body;

  console.log(id);
  validateMongoDbId(id);

  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        "shippingAddress.isdefault": isdefault,
      },
      { new: true }
    );
    res.json(updatedUser);
  } catch (error) {
    throw new Error(error);
  }
});

// Get all users

const getallUser = asyncHandler(async (req, res) => {
  try {
    const getUsers = await User.find().populate("wishlist");
    res.json(getUsers);
  } catch (error) {
    throw new Error(error);
  }
});

// Get a single user

const getaUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const getaUser = await User.findById(id);
    res.json({
      getaUser,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// Get a single user

const deleteaUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const deleteaUser = await User.findByIdAndDelete(id);
    res.json({
      deleteaUser,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const blockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const userToken = await User.findById(id);
    const blockusr = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: true,
      },
      {
        new: true,
      }
    );
    if (userToken?.isNotification) {
      const token = userToken?.fcmToken;
      const noti = {
        title: "Block account",
        body: "Admin have block your account",
      };
      sendNotification(token, noti);
    }
    res.json(blockusr);
  } catch (error) {
    throw new Error(error);
  }
});

const unblockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const unblock = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: false,
      },
      {
        new: true,
      }
    );
    res.json({
      message: "User UnBlocked",
    });
  } catch (error) {
    throw new Error(error);
  }
});

const updatePassword = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;
  console.log(req.params);
  validateMongoDbId(id);
  const user = await User.findById(id);
  if (password) {
    user.password = password;
    const updatedPassword = await user.save();
    res.json(updatedPassword);
  } else {
    res.json(user);
  }
});

const forgotPasswordToken = asyncHandler(async (req, res) => {
  const { email } = req.body;

  console.log(req.body);
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found with this email");
  try {
    const verificationCode = Math.floor(1000 + Math.random() * 9000);

    const expirationTime = new Date();
    expirationTime.setMinutes(expirationTime.getMinutes() + 10);

    console.log("verificationCode", verificationCode, expirationTime);
    user.verificationCode = verificationCode;
    user.verificationCodeExpiration = expirationTime;
    await user.save();
    const resetURL = `  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2>Password Reset</h2>
    <p>Hello User,</p>
    <p>Please use the verification code below to reset your password. This code is valid for the next 10 minutes:</p>
    <h3>Verification Code: ${verificationCode} </h3>
    <p>If you did not request a password reset, please ignore this email.</p>
    <p>Thank you!</p>
  </div>`;
    const sub = "Forgot Password Code";
    sendVerificationEmail(email, resetURL, sub);

    if (user?.isNotification) {
      const token = user?.fcmToken;
      const noti = {
        title: "Email Sent",
        body: "Please check your email for otp",
      };
      sendNotification(token, noti);
    }
    res.json({
      success: true,
      verificationCode: verificationCode,
      uid: user?._id,
    });

    // const token = await user.createPasswordResetToken();
    // await user.save();
    // const resetURL = `Hi, Please follow this link to reset Your Password. This link is valid till 10 minutes from now. <a href='http://localhost:5000/api/user/reset-password/${token}'>Click Here</>`;
    // const data = {
    //   to: email,
    //   text: "Hey User",
    //   subject: "Forgot Password Link",
    //   htm: resetURL,
    // };
    // sendVerificationEmail(resetURL);
    // res.json(token);
  } catch (error) {
    throw new Error(error);
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) throw new Error(" Token Expired, Please try again later");
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  res.json(user);
});

const getWishlist = asyncHandler(async (req, res) => {
  const { _id } = req.params;
  console.log(_id);
  try {
    const findUser = await User.findById(_id).populate("wishlist");
    res.json(findUser);
  } catch (error) {
    throw new Error(error);
  }
});

const removeFromWishlist = asyncHandler(async (req, res) => {
  const { _id, protId } = req.params;
  console.log(_id, protId);
  // const { protId } = req.body;
  try {
    // Find the user by userId
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove the productId from the wishlist array
    user.wishlist = user.wishlist.filter((id) => id.toString() !== protId);
    // await Product.findByIdAndUpdate(protId, { isLike: false });
    await user.save();

    if (user?.isNotification) {
      const token = user?.fcmToken;
      const noti = {
        title: "Remove item",
        body: "You have successfully item deleted from whislist",
      };
      sendNotification(token, noti);
    }
    // Save the updated user document
    // const updatedUser = await user.save();
    res.json({ success: true });
  } catch (error) {
    throw new Error(error);
  }
});

const userCart = asyncHandler(async (req, res) => {
  const { cart } = req.body;
  console.log(cart);
  const { _id } = req.params;
  // const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    let products = [];
    const user = await User.findById(_id);
    // check if user already have product in cart
    const alreadyExistCart = await Cart.findOne({ orderby: user._id });
    if (alreadyExistCart) {
      alreadyExistCart.remove();
    }
    for (let i = 0; i < cart.length; i++) {
      let object = {};
      object.product = cart[i]._id;
      object.count = cart[i].count;
      // object.color = cart[i].color;
      let getPrice = await Product.findById(cart[i]._id).select("price").exec();
      object.price = getPrice.price;
      products.push(object);
    }
    let cartTotal = 0;
    for (let i = 0; i < products.length; i++) {
      cartTotal = cartTotal + products[i].price * products[i].count;
    }
    let newCart = await new Cart({
      products,
      cartTotal,
      orderby: user?._id,
    }).save();

    res.json(newCart);
  } catch (error) {
    throw new Error(error);
  }
});

const addToCart = asyncHandler(async (req, res) => {
  try {
    const { _id, count, price, isLike } = req.body.updatedCart;
    const { id } = req.params;

    // console.log("all", req.body);
    console.log("id", id);
    validateMongoDbId(id);

    const user = await User.findById(id);

    // Find the cart for the user
    let cart = await Cart.findOne({ orderby: user._id });

    // If cart doesn't exist, create a new one
    if (!cart) {
      cart = new Cart({
        orderby: user._id,
        products: [],
        cartTotal: 0,
        isLike: false,
      });
    }

    const existingProductIndex = cart.products.findIndex(
      (item) => item.product.toString() === _id
    );

    if (existingProductIndex !== -1) {
      // Product already exists, update quantity
      cart.products[existingProductIndex].count += count;
    } else {
      // Product not found, add it to the cart
      cart.products.push({
        product: _id,
        count,
        price,
        isLike,
      });
    }

    cart.cartTotal += price * count;
    await cart.save();

    if (user?.isNotification) {
      const token = user?.fcmToken;
      const noti = {
        title: "Cart",
        body: "Items Added to Cart",
      };
      sendNotification(token, noti);
    }

    res
      .status(200)
      .json({ message: "Product added to cart successfully", cart });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Increment or decrement product quantity in cart
const updateProductQuantity = asyncHandler(async (req, res) => {
  const { productId, action } = req.body;
  const { id } = req.params;
  console.log(id, productId, action);
  validateMongoDbId(id);
  try {
    const cart = await Cart.findOne({ orderby: id });

    const productIndex = cart.products.findIndex(
      (item) => item.product.toString() === productId
    );

    if (productIndex !== -1) {
      const product = cart.products[productIndex];

      if (action === "increment") {
        // Increment product count
        product.count += 1;
        // Update cart total
        cart.cartTotal += product.price;
      } else if (action === "decrement") {
        // Ensure count doesn't go below 1
        if (product.count > 1) {
          // Decrement product count
          product.count -= 1;
          // Update cart total
          cart.cartTotal -= product.price;
        }
      }

      // Save the updated cart
      await cart.save();
      res.json({ success: true, msg: "successfully" });
    } else {
      throw new Error("Product not found in cart");
    }
  } catch (error) {
    throw new Error("Could not update product quantity");
  }
});
const removeProductFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  console.log(req.body);
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const cart = await Cart.findOne({ orderby: id });

    // Filter out the product to be removed
    cart.products = cart.products.filter(
      (item) => item._id.toString() !== productId
    );

    // Recalculate cart total
    cart.cartTotal = cart.products.reduce(
      (total, item) => total + item.price * item.count,
      0
    );

    // Save the updated cart
    await cart.save();
    res.json({ success: true, msg: "successfully deleted" });
  } catch (error) {
    throw new Error("Could not remove product from cart");
  }
});
const islikeProducts = asyncHandler(async (req, res) => {
  const { _id, isLike } = req.body;
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    // Find the cart by its ID
    const cart = await Cart.findOne({ orderby: id });

    // Find the index of the product in the products array
    const productIndex = cart.products.findIndex((product) =>
      product.product.equals(_id)
    );

    // If the product exists in the cart
    if (productIndex !== -1) {
      // Update the isLike property of the product
      cart.products[productIndex].isLike = isLike;

      // Save the updated cart
      await cart.save();
      res.json({ success: true, msg: "Cart liked successfully." });
      console.log("Cart liked successfully.");
    } else {
      console.log("Product not found in the cart.");
    }
  } catch (error) {
    throw new Error("Could not like product in cart");
  }
});

const getUserCart = asyncHandler(async (req, res) => {
  const { _id } = req.params;
  // const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const cart = await Cart.findOne({ orderby: _id }).populate(
      "products.product"
    );
    res.json(cart);
  } catch (error) {
    throw new Error(error);
  }
});

const emptyCart = asyncHandler(async (req, res) => {
  const { _id } = req.params;
  // const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const user = await User.findOne({ _id });
    const cart = await Cart.findOneAndRemove({ orderby: user._id });
    res.json(cart);
  } catch (error) {
    throw new Error(error);
  }
});

const applyCoupon = asyncHandler(async (req, res) => {
  const { coupon } = req.body;
  const { _id } = req.user;
  validateMongoDbId(_id);
  const validCoupon = await Coupon.findOne({ name: coupon });
  if (validCoupon === null) {
    throw new Error("Invalid Coupon");
  }
  const user = await User.findOne({ _id });
  let { cartTotal } = await Cart.findOne({
    orderby: user._id,
  }).populate("products.product");
  let totalAfterDiscount = (
    cartTotal -
    (cartTotal * validCoupon.discount) / 100
  ).toFixed(2);
  await Cart.findOneAndUpdate(
    { orderby: user._id },
    { totalAfterDiscount },
    { new: true }
  );
  res.json(totalAfterDiscount);
});

const createPaymentIntent = asyncHandler(async (req, res) => {
  const { price, customerId, paymentMethodId } = req.body;
  try {
    // const paymentIntent = await stripe.paymentIntents.capture(
    //   'pi_3MrPBM2eZvKYlo2C1TEMacFD'
    // );

    const paymentIntent = await stripe.paymentIntents.create({
      payment_method_types: ["card"],
      amount: 9999,
      currency: "usd",
      customer: customerId,
      payment_method: paymentMethodId,
      // off_session: true,
      confirm: true,
    });
    console.log(paymentIntent.client_secret);
    res.send({ paymentIntentClientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.log(error.message);
    res.status(400).send({ error: error.message });
  }

  // const { _id } = req.params;
  // console.log("id", _id);
  // validateMongoDbId(_id);
  // const user = await User.findById(_id);
  // const customer = await stripe.customers.create({
  //   // email: user.email,
  //   // address: user.BillingAddress.address,
  // });
  // const ephemeralKey = await stripe.ephemeralKeys.create(
  //   { customer: customer.id },
  //   { apiVersion: "2023-10-16" }
  // );
  // const paymentIntent = await stripe.paymentIntents.create({
  //   amount: req.body.price * 100 || 999,
  //   currency: "usd",
  //   payment_method_types: ["card"],
  //   customer: customer.id,

  //   // automatic_payment_methods: {
  //   //   enabled: true,
  //   // },
  // });

  // // console.log(paymentIntent);
  // res.json({
  //   message: "success",
  //   paymentIntent: paymentIntent.client_secret,
  //   ephemeralKey: ephemeralKey.secret,
  //   customer: customer.id,
  //   intentId: paymentIntent.id,
  //   // orderId: newOrder._id,
  // });
});

const SavePaymentDetials = asyncHandler(async (req, res) => {
  const { _id } = req.params;
  const { paymentID } = req.body;
  validateMongoDbId(_id);
  try {
    // Call the getPaymentDetails function
    // const cardDetails = await getPaymentDetails(paymentID, _id);

    // Send the card details in the response
    res.json({ cardDetails });
  } catch (error) {
    // Handle errors
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
const StripeCreateCustomer = asyncHandler(async (req, res) => {
  const { paymentMethodId, holderName } = req.body;

  try {
    // Create a new customer
    const customer = await stripe.customers.create({
      name: holderName,
    });

    // Attach the payment method to the customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customer.id,
    });

    // Set the default payment method for the customer
    await stripe.customers.update(customer.id, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    res.send({ success: true, customer });
  } catch (error) {
    console.error(error);
    res.status(400).send({ error: error.message });
  }
});
const StripeAttchedPayment = asyncHandler(async (req, res) => {
  const { customerId, paymentMethodId, card, _id } = req.body;
  try {
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    const cardDetails = {
      last4: card.last4,
      expMonth: card.expiryMonth,
      expYear: card.expiryYear,
      cvcCheck: card.validCVC,
      brand: card.brand,
      paymentMethodId: paymentMethodId,
      customerId: customerId,
      userId: _id,
    };

    console.log(cardDetails);

    // Save or update card details in MongoDB
    if (cardDetails) await saveOrUpdateCardDetails(cardDetails);

    res.send({ success: true });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// app.post("/create_payment_intent/:id", async (req, res) => {

// });

// const getPaymentDetails = async (
//   paymentID,
//   _id,
//   customerId,
//   paymentIntentKey
// ) => {
//   try {
//     console.log("this is paymet", paymentID, _id, customerId, paymentIntentKey);
//     // Retrieve payment intent details from Stripe
//     const user = await User.findById(_id);
//     const paymentIntentId = paymentID;
//     const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
//     // const paymentMethodId = paymentIntent.payment_method;
//     // const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
//     let paymentMethod = null;
//     if (paymentIntent.payment_method) {
//       const paymentMethodId = paymentIntent.payment_method;
//       paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
//       console.log("Payment method:", paymentMethod);
//     } else {
//       console.log("Payment method not found for the payment intent");
//     }
//     console.log(paymentMethod);
//     // console.log(paymentMethod);
//     // Extract relevant card details
//     const cardDetails = paymentMethod
//       ? {
//           last4: paymentMethod.card.last4,
//           expMonth: paymentMethod.card.exp_month,
//           expYear: paymentMethod.card.exp_year,
//           cvcCheck: paymentMethod.card.checks.cvc_check,
//           brand: paymentMethod.card.brand,
//           userId: _id,
//         }
//       : {
//           cardHolderName: user.fullName || "john",
//           customerId: customerId,
//           client_secret: paymentIntentKey,
//           paymentID: paymentID,
//           userId: _id,
//         };

//     console.log(cardDetails);

//     // Save or update card details in MongoDB
//     if (cardDetails) await saveOrUpdateCardDetails(cardDetails);

//     return cardDetails;
//   } catch (error) {
//     console.error("Error retrieving payment details:", error);
//     throw error;
//   }
// };

const saveOrUpdateCardDetails = async (cardDetails) => {
  try {
    // Check if the user already exists in the database
    const existingUser = await Card.findOne({ userId: cardDetails.userId });

    if (existingUser) {
      // If the user exists, update their card details
      await Card.updateOne(
        { userId: cardDetails.userId },
        { $set: cardDetails },
        { new: true }
      );

      console.log("Card details updated for user:", cardDetails.userId);
    } else if (!existingUser) {
      // If the user doesn't exist, create a new user document with card details
      await Card.create(cardDetails);
      console.log("Card details saved for new user:", cardDetails.userId);
    }
  } catch (error) {
    console.error("Error saving/updating card details:", error);
    throw error;
  }
};

const getCardDetailsByUserId = async (req, res) => {
  const { id } = req.params;
  try {
    // Retrieve card details for the given user ID from MongoDB
    const card = await Card.findOne({ userId: id });
    if (!card) {
      console.log("User not found with ID:", id);
      res.json({ success: false });
      return;
    }
    res.json(card);
  } catch (error) {
    console.error("Error retrieving card details:", error);
    throw error;
  }
};

const createOrder = asyncHandler(async (req, res) => {
  const { COD, couponApplied, customerId, paymentID, paymentIntentKey } =
    req.body;
  // console.log(req.body);
  const { _id } = req.params;
  validateMongoDbId(_id);
  try {
    // if (!COD) throw new Error("Create cash order failed");
    const user = await User.findById(_id);
    let userCartSave = await Cart.findOne({ orderby: user._id });
    let userCart = await Cart.findOne({ orderby: user._id })
      .populate("products.product")
      .exec();
    // console.log(userCart.products);
    let finalAmout = 0;
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const timestamp = Date.now();
    if (couponApplied && userCartSave.totalAfterDiscount) {
      finalAmout = userCartSave.totalAfterDiscount;
    } else {
      finalAmout = userCartSave.cartTotal;
    }
    const orderNumber = `ORD-${timestamp}-${randomDigits}`;
    let newOrder = await new Order({
      products: userCartSave.products,
      orderNumber: orderNumber,
      paymentIntent: {
        id: uniqid(),
        method: "Card",
        amount: finalAmout,
        status: "Processing",
        created: Date.now(),
        currency: "usd",
      },
      paymentStatus: "completed",
      orderby: user._id,
      orderStatus: "Processing",
    }).save();
    let update = userCartSave.products.map((item) => {
      return {
        updateOne: {
          filter: { _id: item.product._id },
          update: { $inc: { quantity: -item.count, sold: +item.count } },
        },
      };
    });

    if (user?.isNotification) {
      const token = user?.fcmToken;
      const noti = {
        title: "Order",
        body: "You have order successfully check you email for invoice",
      };
      sendNotification(token, noti);
    }

    orderEmail(
      orderNumber,
      "Processing",
      finalAmout,
      userCart.products,
      user.email,
      user.fullName
    );
    res.json({
      message: "success",
      success: true,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const getOrders = asyncHandler(async (req, res) => {
  const { _id } = req.params;
  validateMongoDbId(_id);
  console.log(_id);
  try {
    const userorders = await Order.find({ orderby: _id })
      .populate("products.product")
      .exec();
    // .populate("orderby");

    // console.log("==============", userorders);
    const formattedOrders = userorders?.map((order) => {
      const productInfo = order.products.map((product) => ({
        _id: product.product._id,
        title: product.product.title,
        tags: product.product.tags,
        category: product.product.category,
        image: product.product.images[0].url,
        price: product.product.price,
        count: product.count,
      }));

      // Return formatted order object
      return {
        orderNumber: order.orderNumber,
        orderStatus: order.orderStatus,
        totalAmount: order.paymentIntent.amount,
        OrderTime: order.createdAt,
        items: productInfo,
      };
    });

    // console.log(formattedOrders);
    if (formattedOrders) {
      res.json({
        formattedOrders,
      });
    }
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
});

const getAllOrders = asyncHandler(async (req, res) => {
  try {
    const alluserorders = await Order.find()
      .populate("products.product")
      .populate("orderby")
      .exec();
    res.json(alluserorders);
  } catch (error) {
    throw new Error(error);
  }
});
const getOrderByUserId = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const userorders = await Order.findOne({ orderby: id })
      .populate("products.product")
      .populate("orderby")
      .exec();
    res.json(userorders);
  } catch (error) {
    throw new Error(error);
  }
});
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const updateOrderStatus = await Order.findByIdAndUpdate(
      id,
      {
        $set: {
          orderStatus: status,
          "paymentIntent.status": status,
        },
      },
      { new: true }
    );
    res.json(updateOrderStatus);
  } catch (error) {
    throw new Error(error);
  }
});

const updateProfilePic = asyncHandler(async (req, res) => {
  const { profileUrl, prevPro, uname } = req.body;
  const { id } = req.params;
  // console.log(id);
  let imageUrl = {};
  // const url = `data:image/jpeg;base64,${profileUrl}`;
  const folder = uname;
  // console.log("to chl raha hn ",uname);
  if (prevPro?.public_id) {
    imageUrl = await cloudinaryImageUpdater(
      prevPro?.public_id,
      profileUrl,
      folder
    );
    // console.log('update ho raha hn ');
  } else {
    imageUrl = await cloudinaryUploadImg(profileUrl, folder);
    // console.log("uploded img");
  }

  validateMongoDbId(id);
  try {
    const user = await User.findById(id);

    console.log(user);
    const updatePic = await User.findByIdAndUpdate(
      id,
      {
        profilePic: {
          url: imageUrl?.url,
          asset_id: imageUrl?.asset_id,
          public_id: imageUrl?.public_id,
        },
      },
      { new: true }
    );

    if (user?.isNotification) {
      const token = user?.fcmToken;
      const noti = {
        title: "Update Profile",
        body: "Successfully Updated",
      };
      sendNotification(token, noti);
    }
    res.json({ updatePic: updatePic?.profilePic, success: true });
  } catch (error) {
    throw new Error(error);
  }
});

const addParameter = async (req, res) => {
  try {
    const result = await User.updateMany({}, { $set: { fcmToken: "" } });
    res.json({ data: `${result} users updated` });
  } catch (error) {
    console.error("Error updating users:", error);
  }
};
const updateCalAndNotifi = async (req, res) => {
  const { id } = req.params;
  const { isSyncCalender, isNotification } = req.body.userData;

  // console.log(req.body);
  // console.log(isSyncCalender, isNotification);
  try {
    let updateFields = {};
    if (isSyncCalender !== null) {
      updateFields.isSyncCalender = isSyncCalender;
    }
    if (isNotification !== null) {
      updateFields.isNotification = isNotification;
    }

    const updatedSettings = await User.findByIdAndUpdate(
      id,
      {
        $set: updateFields,
      },
      { new: true, runValidators: true }
    );
    if (!updatedSettings) {
      return res.status(404).send("User settings not found");
    }
    res.status(200).json({ success: true });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while updating user settings" });
  }
};

module.exports = {
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
  getOrderByUserId,
  updateProfilePic,
  saveProfileAddressStatus,
  addToCart,
  updateProductQuantity,
  removeProductFromCart,
  islikeProducts,
  createPaymentIntent,
  loginUserWithGoogle,
  loginUserWithFB,
  removeFromWishlist,
  updatedUserProfile,
  // getPaymentDetails,
  getCardDetailsByUserId,
  SavePaymentDetials,
  addParameter,
  StripeAttchedPayment,
  StripeCreateCustomer,
  updateCalAndNotifi,
  fcmToken,
};
