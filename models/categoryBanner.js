const mongoose = require("mongoose");
const categoryBannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    // buttonText: {
    //   type: String,
    //   required: true,
    //   trim: true,
    // },

    bannerImage: { type: String },
    bannerImageAltText: {
      type: String,
      trim: true,
    },
    // bannerImageText: { type: String },
    // bannerImageTextAltText: {
    //   type: String,
    //   trim: true,
    // },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CategoryBanner", categoryBannerSchema);
