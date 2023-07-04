const mongoose = require("mongoose");
const orientationSchema = new mongoose.Schema(
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
    ocAppointment: {
      type: String,
      required: true,
      trim: true,
    },
    service: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    purchaseAssistance: { type: String },
    email: { type: String },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Orientation", orientationSchema);
