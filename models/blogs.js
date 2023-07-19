const mongoose = require("mongoose");
const blogs = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    text: {
      type: String,
      required: true,
    },
    pageTitle: {
      type: String,
      required: true,
      trim: true,
    },
    pageHeading: {
      type: String,
      required: true,
      trim: true,
    },
    blogCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref:"BlogCategory",
      required: true,
      trim: true,
    },
    imageAltText: {
      type: String,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    image: { type: String },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("blogs", blogs);
