const express = require("express");
const userController = require("../controller/userBasicInfoController");
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

router.post("/create", upload.single("file"), userController.createUser);
router.get("/getAll_UsersInfo", userController.getAllUsers);
router.get("/getInfoById/:id", userController.getUserById);
router.put("/update/:id", userController.updateUserById);
router.delete("/delete/:id", userController.deleteUserById);
router.post("/addPara", userController.addPara);

module.exports = router;
