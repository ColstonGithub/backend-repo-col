const mongoose = require("mongoose");
const initialImagesSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
    },
    image: { type: String },
    imageAltText: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("InitialImages", initialImagesSchema);
