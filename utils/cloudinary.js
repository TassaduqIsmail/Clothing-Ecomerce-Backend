const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "ds8wtc0yi",
  api_key: "344266855257532",
  api_secret: "xD6AClo-y3LlMBtAWYEaLZuzbUs",
});
// CLOUD_NAME= 'ds8wtc0yi'
// API_KEY='344266855257532'
// SECRET_KEY='xD6AClo-y3LlMBtAWYEaLZuzbUs'
const cloudinaryUploadImg = async (fileToUploads, name) => {
  // return new Promise((resolve, reject) => {
  //   cloudinary.uploader.upload(
  //     fileToUploads,
  //     { name, resource_type: "auto" },
  //     (error, result) => {
  //       if (error) {
  //         reject(error);
  //       } else {
  //         resolve({
  //           url: result.secure_url,
  //           asset_id: result.asset_id,
  //           public_id: result.public_id,
  //         });
  //       }
  //     }
  //   );
  // });
  // const result = await cloudinary.uploader.upload(fileToUploads);

  // console.log("results:", result);
  // return {
  //   url: result?.secure_url,
  //   asset_id: result?.asset_id,
  //   public_id: result?.public_id,
  // };
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      fileToUploads,
      { folder: name, resource_type: "auto" },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            url: result.secure_url,
            asset_id: result.asset_id,
            public_id: result.public_id,
          });
        }
      }
    );
  });
};
const cloudinaryDeleteImg = async (fileToDelete) => {
  return new Promise((resolve) => {
    cloudinary.uploader.destroy(fileToDelete, (error, result) => {
      if (error) {
        console.error(error);
        resolve(null); // Return null if there's an error
      } else {
        console.log(result);
        resolve({
          asset_id: result.asset_id,
          public_id: result.public_id,
          resource_type: "auto",
        });
      }
    });
  });
};


const cloudinaryImageUpdater = (imagePublicId, imagePath, folderName) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(imagePath, { public_id: imagePublicId, folder: folderName })
      .then(result => {
        resolve({
          url: result.secure_url,
          asset_id: result.asset_id,
          public_id: result.public_id,
        });
      })
      .catch(error => {
        reject(new AppError(
          StatusCodes.BAD_REQUEST,
          "Cannot update image. Please try again."
        ));
      });
  });
};


module.exports = { cloudinaryUploadImg, cloudinaryDeleteImg,cloudinaryImageUpdater };
