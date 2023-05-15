const mongoose = require("mongoose");
const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      trim: true,
    },
    faqCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref:"FaqCategory",
      required: true,
      trim: true,
    },
    answer: {
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

module.exports = mongoose.model("Faq", faqSchema);
