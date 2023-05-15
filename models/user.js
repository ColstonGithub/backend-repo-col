const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      trim: true,
      min: 3,
      max: 20,
      required: true,
    },

    lastName: {
      type: String,
      trim: true,
      min: 3,
      max: 20,
      required: true,
    },

    userName: {
      type: String,
      trim: true,
      min: 3,
      max: 20,
      unique: true,
      index: true,
      lowercase: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      min: 3,
      max: 20,
      lowercase: true,
    },

    hash_password: {
      type: String,
      reuired: true,
    },

    role: {
      type: String,
      reuired: true,
    },

    profilePicture: {
      type: String,
    },
    contactNumber: {
      type: String,
    },
  },

  { timestamps: true }
);

userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.methods.authenticate = function (password) {
  return bcrypt.compareSync(password, this.hash_password);
};

module.exports = mongoose.model("User", userSchema);
