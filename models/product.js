const { required } = require("joi");
const mongoose = require("mongoose");
const productPictureSchema = new mongoose.Schema({
  img: {
    type: String,
  },
  colorImageAltText: {
    type: String,
  },
});
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },

    slug: {
      type: String,
    },

    description: {
      type: String,
      trim: true,
    },

    colors: [
      {
        colorName: {
          type: String,
        },
        productPictures: [productPictureSchema],
      },
    ],

    amazonLink: {
      type: String,
      trim: true,
    },

    specification: {
      type: String,
      trim: true,
    },

    pdf: {
      type: String,
    },
    customOrder: { type: Number },
    productPictures: [
      {
        img: {
          type: String,
        },
        imageAltText: {
          type: String,
        },
      },
    ],

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
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

module.exports = mongoose.model("Product", productSchema);
