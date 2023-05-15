const mongoose = require("mongoose");
const brandProductSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    text: {
        type: String,
        required: true,
        trim: true,
      },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    imageAltText: {
      type: String,
      trim: true,
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

module.exports = mongoose.model("brandProduct", brandProductSchema);
