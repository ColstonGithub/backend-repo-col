const mongoose = require("mongoose");
const whereToBuySchema = new mongoose.Schema(
  {
    city: {
      type: String,
      required: true,
      trim: true,
    },
    centerName: {
      type: String,
      trim: true,
    },
    centerAddress: {
      type: String,
      trim: true,
    },


    location: {
      type: String,
      trim: true,
    },

    email: { type: String },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WhereToBuy", whereToBuySchema);
