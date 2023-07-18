const User = require("../../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const shortid = require("shortid");

const signup = async (req, res) => {
  try {
    User.findOne({ email: req.body.email }).exec((error, user) => {
      if (user)
        return res.status(400).json({
          message: "Admin already registered",
        });

      User.estimatedDocumentCount(async (err, count) => {
        if (err) return res.status(400).json({ error });
        let role = "admin";
        if (count === 0) {
          role = "super-admin";
        }

        const { firstName, lastName, email, password } = req.body;
        const hash_password = await bcrypt.hash(password, 10);
        const _user = new User({
          firstName,
          lastName,
          email,
          hash_password,
          username: shortid.generate(),
          role,
        });
        _user.save((error, data) => {
          if (error) {
            return res.status(400).json({
              message: `Something went wrong ${error.message}`,
            });
          }

          if (data) {
            return res.status(201).json({
              message:
                _user.role == "super-admin"
                  ? "Super Admin Created Successfully"
                  : "Admin Created Successfully..!",
            });
          }
        });
      });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const signin = async (req, res) => {
  try {
    User.findOne({ email: req.body.email }).exec(async (error, user) => {
      if (error) return res.status(400).json({ error });
      if (user) {
        const isPassword = await user.authenticate(req.body.password);
        if (
          isPassword &&
          (user.role === "admin" || user.role === "super-admin")
        ) {
          const token = jwt.sign(
            { _id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "15d" }
          );
          const { _id, firstName, lastName, email, role, fullName } = user;
          res.cookie("token", token, { expiresIn: "15d" });

          res.status(200).json({
            token,
            user: { _id, firstName, lastName, email, role, fullName },
          });
        } else {
          return res.status(400).json({
            message: "Invalid Credentials",
          });
        }
      } else {
        return res.status(400).json({ message: "User not found" });
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const signout = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({
    message: "Signout successfully...!",
  });
};

const getUserData = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    return res.status(200).json({ user: user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateProfile = async (req, res) => {
  const { firstName, lastName, username, contactNumber, password } = req.body;

  try {
    // Create a newMember object
    let userId = req.body.userId;
    let user = await User.findById(userId).select("-password");
    const salt = await bcrypt.genSalt(10);

    const newUser = {};

    if (firstName) {
      newUser.firstName = firstName;
    }
    if (lastName) {
      newUser.lastName = lastName;
    }
    if (username) {
      newUser.username = username;
    }

    if (contactNumber) {
      newUser.contactNumber = contactNumber;
    }

    if (password) {
      newUser.hash_password = await bcrypt.hash(password, salt);
    }

    if (req.file) {
      newUser.profilePicture = process.env.API + "/public/" + req.file.filename;
    }

    // Find the userID to be updated and update it
    user = await User.findByIdAndUpdate(
      userId,
      { $set: newUser },
      { new: true }
    );

    res.json({ status: "profile updated Successfuly", user: user });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  signup,
  signin,
  signout,
  updateProfile,
  getUserData,
};
