const UserBasicInfo = require("../models/userBasicInfoModel");
const {
  cloudinaryDeleteImg,
  cloudinaryUploadImg,
} = require("../utils/cloudinary");
const validateMongoDbId = require("../utils/validateMongodbId");
const User = require("../models/userModel");

// Create User
// exports.createUser = async (req, res) => {
//   try {
//     // let { uid, bodyImage } = req.body;
//     console.log(req.body);
//     const {
//       uid,
//       gender,
//       height,
//       weight,
//       chest,
//       hip,
//       shape,
//       styleGuidelines,
//       waist,
//     } = req.body;

//     // const uid = req.body.uid;
//     let bodyImage = req.body.bodyImage;
//     // const userData = { ...req.body };
//     // console.log(req.body);
//     let imageUrl = {};
//     const folder = uid;
//     const base64Data = bodyImage.split(";base64,");
//     console.log(base64Data);

//     if (
//       base64Data[1] !== "" &&
//       base64Data[1] !== null &&
//       base64Data[1] !== "null"
//     ) {
//       const url = `data:image/jpeg;base64,${bodyImage}`;
//       console.log("to chl raha hn ");
//       imageUrl = await cloudinaryUploadImg(bodyImage, folder);
//       console.log("uploded img", imageUrl);
//       // userData.bodyImage = imageUrl;
//     }
//     const newBasicInfo = await UserBasicInfo.create({
//       uid,
//       gender,
//       height,
//       weight,
//       chest,
//       hip,
//       shape,
//       waist,
//       bodyImage: imageUrl,
//       style: {
//         styleRange: 0,
//         styleName: "",
//         isLiked: false,
//         isDislike: false,
//       },
//       styleGuidelines,
//       isEcoFriendly: false,
//     });

//     console.log(newBasicInfo);

//     // validateMongoDbId(uid);
//     // const user = await UserBasicInfo.create(userData);
//     res.status(201).json({
//       status: "success",
//       infoId: newBasicInfo?._id,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(400).json({
//       status: "fail",
//       message: error.message,
//     });
//   }
// };

exports.createUser = async (req, res) => {
  try {
    const {
      uid,
      gender,
      height,
      weight,
      chest,
      hip,
      shape,
      styleGuidelines,
      waist,
      hipHeight,
    } = req.body;

    let bodyImage = req.body.bodyImage;
    let imageUrl = {};
    const folder = uid;
    const base64Data = bodyImage.split(";base64,");

    if (
      base64Data[1] !== "" &&
      base64Data[1] !== null &&
      base64Data[1] !== "null"
    ) {
      imageUrl = await cloudinaryUploadImg(bodyImage, folder);
    }

    // Check if user with the provided UID already exists
    let existingUser = await UserBasicInfo.findOne({ uid });
    const updatedUser = await User.findOneAndUpdate(
      { _id: uid },
      { $set: { isBasicInfo: true } },
      { new: true } // Return the updated document
    );
    // if (!updatedUser) {
    //   return { success: false, message: "User not found" };
    // }

    if (existingUser) {
      // If user exists, update the user's data
      // existingUser.gender = gender;
      // existingUser.height = height;
      // existingUser.weight = weight;
      // existingUser.chest = chest;
      // existingUser.hip = hip;
      // existingUser.shape = shape;
      // existingUser.waist = waist;
      // existingUser.hipHeight = hipHeight;
      // existingUser.bodyImage = imageUrl;
      // existingUser.styleGuidelines = styleGuidelines;
      // await existingUser.save();
      const updatedFields = {
        gender,
        height,
        weight,
        chest,
        hip,
        shape,
        waist,
        hipHeight,
        bodyImage: imageUrl,
        styleGuidelines,
      };

      await existingUser.update(updatedFields);
      res.status(200).json({
        status: "success",
        message: "User data updated successfully",
        infoId: existingUser._id,
      });
    } else {
      // If user does not exist, create a new user
      const newBasicInfo = await UserBasicInfo.create({
        uid,
        gender,
        height,
        weight,
        chest,
        hip,
        shape,
        waist,
        hipHeight,
        bodyImage: imageUrl,
        style: {
          styleRange: 0,
          styleName: "",
          isLiked: false,
          isDislike: false,
        },
        styleGuidelines,
        isEcoFriendly: false,
      });

      res.status(201).json({
        status: "success",
        message: "User created successfully",
        infoId: newBasicInfo._id,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

// Get all Users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await UserBasicInfo.find();
    res.status(200).json({
      status: "success",
      results: users.length,
      data: users,
    });
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message: err.message,
    });
  }
};

// Get User by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await UserBasicInfo.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }
    res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message: err.message,
    });
  }
};

// Update User by ID
exports.updateUserById = async (req, res) => {
  try {
    console.log("boday", req.body);
    const user = await UserBasicInfo.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }
    console.log(user);
    res.status(200).json({
      status: "success",
      infoId: user?._id,
      // data: user,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

// Delete User by ID
exports.deleteUserById = async (req, res) => {
  try {
    const user = await UserBasicInfo.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }
    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message: err.message,
    });
  }
};
exports.addPara = async (req, res) => {
  try {
    await UserBasicInfo.updateMany({}, { $set: { hipHeight: "30" } });

    res.status(200).json({
      status: "success",
      message: "Hip height added to all existing data successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "An error occurred while updating hip height for existing data",
      error: error.message,
    });
  }
};
