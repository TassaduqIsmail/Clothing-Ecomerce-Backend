const bodyParser = require("body-parser");
const express = require("express");
const dbConnect = require("./config/dbConnect");
const { notFound, errorHandler } = require("./middlewares/errorHandler");
const app = express();
const fs = require("fs");
const path = "./version.json";
const dotenv = require("dotenv").config();
const PORT = process.env.PORT || 5000;
const authRouter = require("./routes/authRoute");
const productRouter = require("./routes/productRoute");
const blogRouter = require("./routes/blogRoute");
const categoryRouter = require("./routes/prodcategoryRoute");
const blogcategoryRouter = require("./routes/blogCatRoute");
const brandRouter = require("./routes/brandRoute");
const colorRouter = require("./routes/colorRoute");
const enqRouter = require("./routes/enqRoute");
const couponRouter = require("./routes/couponRoute");
const uploadRouter = require("./routes/uploadRoute");
const userBasicInfoRoutes = require("./routes/userBasicInfoRoutes");
const eventsRoute = require("./routes/eventsRoute");
const haveALooksRoute = require("./routes/haveALooksRoute");
const haveALooksCat = require("./routes/haveALooksCatRoute");
const looksMainCat = require("./routes/LooksMainCatRoute");
const faqsRoutes = require("./routes/faqsRoutes");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const cors = require("cors");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

dbConnect();
app.use(morgan("dev"));
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use("/api/user", authRouter);
app.use("/api/product", productRouter);
app.use("/api/blog", blogRouter);
app.use("/api/category", categoryRouter);
app.use("/api/blogcategory", blogcategoryRouter);
app.use("/api/brand", brandRouter);
app.use("/api/coupon", couponRouter);
app.use("/api/color", colorRouter);
app.use("/api/enquiry", enqRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/userBasicInfo", userBasicInfoRoutes);
app.use("/api/events", eventsRoute);
app.use("/api/haveALooksRoute", haveALooksRoute);
app.use("/api/haveALooksSubCat", haveALooksCat);
app.use("/api/looksMainCat", looksMainCat);
app.use("/api/faqs", faqsRoutes);

app.get("/api/version", (req, res) => {
  fs.readFile(path, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading version file:", err);
      return res.status(500).send("Internal Server Error");
    }
    res.json(JSON.parse(data));
  });
});

app.use(notFound);
app.use(errorHandler);
app.listen(PORT, () => {
  console.log(`Server is running  at PORT ${PORT}`);
});
