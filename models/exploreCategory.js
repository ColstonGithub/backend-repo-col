const mongoose = require("mongoose");
const exploreCategorySchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: true,
    },
    imageTitle: {
      type: String,
      required: true,
    },
    imageAltText: {
      type: String,
    },
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

module.exports = mongoose.model("ExploreCategory", exploreCategorySchema);
