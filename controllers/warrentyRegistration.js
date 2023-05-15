const WarrentyRegistration = require("../models/warrentyRegistration");
const shortid = require("shortid");
const slugify = require("slugify");
const bcrypt = require("bcrypt");
exports.createWarrentyRegistration = async (req, res) => {
  try {
    const { name, email, subject, mobileNo, password } = req.body;

    const hash_password = await bcrypt.hash(password, 10);
    const warrentyRegistration = new WarrentyRegistration({
      name,
      slug: slugify(name),
      email,
      mobileNo,
      subject,
      hash_password,
      // createdBy: req.user._id,
    });

    warrentyRegistration.save((error, warrentyReg) => {
      if (error) return res.status(400).json({ error });
      if (warrentyReg) {
        res.status(200).json({ warrentyRegistration: warrentyReg });
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getWarrentyRegistrationById = async (req, res) => {
  try {
    const { id } = req.params;
    if (id) {
      await WarrentyRegistration.findOne({ _id: id }).exec(
        (error, warrentyReg) => {
          if (error) return res.status(400).json({ error });
          if (warrentyReg) {
            res.status(200).json({ warrentyRegistration: warrentyReg });
          }
        }
      );
    } else {
      return res.status(400).json({ error: "Params required" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// new update
exports.deleteWarrentyRegistrationById = async (req, res) => {
  try {
    const { id } = req.body;
    if (id) {
      await WarrentyRegistration.deleteOne({ _id: id }).exec(
        (error, result) => {
          if (error) return res.status(400).json({ error });
          if (result) {
            res.status(202).json({ result });
          }
        }
      );
    } else {
      res.status(400).json({ error: "Params required" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getWarrentyRegistration = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10; // Set a default of 10 items per page
  const page = parseInt(req.query.page) || 1; // Set a default page number of 1

  try {
    const warrentyReg = await WarrentyRegistration.find({})
      .sort({ _id: -1 })
      .limit(limit)
      .skip(limit * page - limit);

    const count = await WarrentyRegistration.countDocuments().exec();
    const totalPages = Math.ceil(count / limit);

    if (warrentyReg) {
      res.status(200).json({
        warrentyRegistration: warrentyReg,
        pagination: { currentPage: page, totalPages, totalItems: count },
      });
    } else {
      return res.status(400).json({ error: error.message });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateWarrentyRegistration = async (req, res) => {
  try {
    const { _id, name, email, mobileNo, subject, password } = req.body;
    const hash_password = await bcrypt.hash(password, 10);
    const warrentyReg = {
      // createdBy: req.user._id,
    };

    if (subject != undefined) {
      warrentyReg.subject = subject;
    }
    if (mobileNo != undefined) {
      warrentyReg.mobileNo = mobileNo;
    }

    if (hash_password != undefined) {
      warrentyReg.hash_password = hash_password;
    }

    if (name != undefined) {
      warrentyReg.name = name;
      warrentyReg.slug = slugify(name);
    }
    if (email != undefined) {
      warrentyReg.email = email;
    }

    const updatedWarrentyRegistration =
      await WarrentyRegistration.findOneAndUpdate({ _id }, warrentyReg, {
        new: true,
      });
    return res.status(201).json({ updatedWarrentyRegistration });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
