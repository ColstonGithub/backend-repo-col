const { required } = require("joi");
const mongoose = require("mongoose");

const catalogueSchema = new mongoose.Schema(
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

    pdf: {
      type: String,
    },

    imageAltText: {
      type: String,
      trim: true,
    },

    image: {
      type: String,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedAt: Date,
  },

  { timestamps: true }
);

module.exports = mongoose.model("Catalogue", catalogueSchema);
