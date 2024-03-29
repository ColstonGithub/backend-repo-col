const mongoose = require("mongoose");
const warrentyRegistrationSchema = new mongoose.Schema(
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
    email: {
      type: String,
      required: true,
    },
    image: { type: String },

    mobileNo: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      trim: true,
    },
    // createdBy: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "User",
    //   required: true,
    // },
  },
  { timestamps: true }
);

warrentyRegistrationSchema.methods.authenticate = function (password) {
  return bcrypt.compareSync(password, this.hash_password);
};

module.exports = mongoose.model(
  "WarrentyRegistration",
  warrentyRegistrationSchema
);
