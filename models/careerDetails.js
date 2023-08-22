const mongoose = require("mongoose");
const careerDetails = new mongoose.Schema(
  {
    contentText: {
      type: String,
      required: true,
    },
    contentHeading: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
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

module.exports = mongoose.model("careerDetails", careerDetails);
