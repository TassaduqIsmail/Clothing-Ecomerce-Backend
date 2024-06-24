const fs = require("fs");
const asyncHandler = require("express-async-handler");

const {
  cloudinaryUploadImg,
  cloudinaryDeleteImg,
} = require("../utils/cloudinary");
const moodChecking = require("../middlewares/moodsChecking");
const uploadImages = asyncHandler(async (req, res) => {
  try {
    const uploader = (path) => cloudinaryUploadImg(path, "images");
    const urls = [];
    const moods = []
    const files = req.files;

    for (const file of files) {
      const { path } = file;
      console.log("path", path);
      const newpath = await uploader(path);
      const imgMood = await moodChecking(path)
      // console.log(imgMood);
      imgMood?.map((v)=>{
            moods.push(v);
    
          })
      urls.push(newpath);
      fs.unlinkSync(path);
    }
    const images = urls.map((file) => {
      return file;
    });
    // console.log('======================nkjahsdjkfhsdjk',moods);
    res.json({images:images,moods:moods});


    // for (const file of files) {
    //   const { path } = file;
    //   console.log('Image path:', path);
      
    //   // const newpath = await uploader(path);
    //   const imgMood = await moodChecking(path);

    //   console.log('Image Mood:', imgMood);
      
    //   imgMood?.map((v)=>{
    //     moods.push(v);

    //   })
    //   // urls.push(newpath);
      
    //   // Optionally remove the file after processing if needed
    //   fs.unlinkSync(path);
    // }
    // console.log(moods);
    // res.json({ images: urls, moods });
    
  } catch (error) {
    console.log(error.message);
    throw new Error(error);
  }
});
const deleteImages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = cloudinaryDeleteImg(id, "images");
    res.json({ message: "Deleted" });
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  uploadImages,
  deleteImages,
};
