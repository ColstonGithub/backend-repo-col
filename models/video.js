const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    video: {
      type: String, // You can also use Buffer for storing binary data
      required: true,
    },
    poster: {
      type: String, // You can also use Buffer for storing binary data
      required: true,
    },
    metaData: {
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

module.exports = mongoose.model("Video", videoSchema);
