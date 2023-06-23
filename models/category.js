const mongoose = require("mongoose");
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
    },
    keyword : {
      type:String,
    },
    categoryImage: { type: String },
    imageAltText: {
      type: String,
      trim: true,
    },
    parentId: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);
