const express = require("express");
const app = express();
const dotenv = require("dotenv");
const path = require("path");
const { connectDB } = require("./config/db");
const {
  notFound,
  errorHandler,
} = require("./common-middleware/errorMiddleware");

const cors = require("cors");

//////////////////////////////////////////////////////////
//routes

const adminRoutes = require("./routes/admin/auth");
const categoryRoutes = require("./routes/category");
const homepageBannerRoutes = require("./routes/homepageBanner");
const categoryBannerRoutes = require("./routes/categoryBanner");
const productRoutes = require("./routes/product");
const slider = require("./routes/slider");
const brandProduct = require("./routes/brandProduct");
const corporateProduct = require("./routes/corporateProduct");
const newsPress = require("./routes/newsPress");
const catalogue = require("./routes/catalogue");
const blogs = require("./routes/blogs");
const brandPageBanner = require("./routes/brandPageBanner");
const corporatePageBanner = require("./routes/corporatePageBanner");
const newsPressBanner = require("./routes/newsPressBanner");
const exhibition = require("./routes/exhibition");
const virtualTour = require("./routes/virtualTour");
const video = require("./routes/video");
const careClean = require("./routes/careClean");
const cataloguePageBanner = require("./routes/cataloguePageBanner");
const aboutUs = require("./routes/aboutUs");
const faq = require("./routes/faq");
const faqCategory = require("./routes/faqCategory");
const exploreCategory = require("./routes/exploreCategory");
const contactUs = require("./routes/contactUs");
const career = require("./routes/career");
const requestForQuotation = require("./routes/requestForQuotation");
const warrentyRegistration = require("./routes/warrentyRegistration");
const blogsCategory = require("./routes/blogsCategory");
const orientationCenter = require("./routes/orientation");
const whereToBuy = require("./routes/whereToBuy");
///////////////////////////////////////////////////////////

// environment variable or constants
dotenv.config();

// connecting to mongoDB and then running server on oprt 5000
const port = process.env.PORT || 5000;

connectDB();

app.use(cors());
app.use(express.json());
app.use("/public", express.static(path.join(__dirname, "uploads")));
app.use(express.urlencoded({ extended: true }));

// app.use(function(req, res, next) {
//   res.setHeader('Access-Control-Allow-Origin', 'https://admin-repo-col.vercel.app');
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE');
//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//   next();
// });

app.use(function (req, res, next) {
  //Enabling CORS
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,PATCH");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization"
  );
  next();
});
////////////////////////////////////////////////////

app.use("/api", adminRoutes);
app.use("/api", categoryRoutes);
app.use("/api", homepageBannerRoutes);
app.use("/api", categoryBannerRoutes);
app.use("/api", productRoutes);
app.use("/api", slider);
app.use("/api", brandProduct);
app.use("/api", corporateProduct);
app.use("/api", newsPress);
app.use("/api", catalogue);
app.use("/api", blogs);
app.use("/api", blogsCategory);
app.use("/api", brandPageBanner);
app.use("/api", corporatePageBanner);
app.use("/api", newsPressBanner);
app.use("/api", exhibition);
app.use("/api", virtualTour);
app.use("/api", video);
app.use("/api", careClean);
app.use("/api", cataloguePageBanner);
app.use("/api", aboutUs);
app.use("/api", faq);
app.use("/api", faqCategory);
app.use("/api", exploreCategory);
app.use("/api", contactUs);
app.use("/api", career);
app.use("/api", requestForQuotation);
app.use("/api", warrentyRegistration);
app.use("/api", orientationCenter);
app.use("/api", whereToBuy);
////////////////////////////////////////////////////

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log("Backend server is running at port", port);
});
