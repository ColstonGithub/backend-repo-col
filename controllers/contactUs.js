const ContactUs = require("../models/contactUs");
const shortid = require("shortid");
const slugify = require("slugify");

exports.createContactUs = (req, res) => {
  try {
    const { name, email, subject, mobileNo, message } = req.body;

    const contacts = new ContactUs({
      name,
      slug: slugify(name),
      email,
      mobileNo,
      subject,
      message,
    });

    contacts.save((error, contact) => {
      if (error) return res.status(400).json({ error });
      if (contact) {
        res.status(200).json({ contactUs: contact });
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getContactUsById = async (req, res) => {
  try {
    const { id } = req.params;
    if (id) {
      await ContactUs.findOne({ _id: id }).exec((error, contact) => {
        if (error) return res.status(400).json({ error });
        if (contact) {
          res.status(200).json({ contactUs: contact });
        }
      });
    } else {
      return res.status(400).json({ error: "Params required" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// new update
exports.deleteContactUsById = async (req, res) => {
  try {
    const { id } = req.body;
    if (id) {
      await ContactUs.deleteOne({ _id: id }).exec((error, result) => {
        if (error) return res.status(400).json({ error });
        if (result) {
          res.status(202).json({ result });
        }
      });
    } else {
      res.status(400).json({ error: "Params required" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getContactUs = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10; // Set a default of 10 items per page
  const page = parseInt(req.query.page) || 1; // Set a default page number of 1

  try {
    const contactUs = await ContactUs.find({})
      .sort({ _id: -1 })
      .limit(limit)
      .skip(limit * page - limit);

    const count = await ContactUs.countDocuments().exec();
    const totalPages = Math.ceil(count / limit);

    if (contactUs) {
      res.status(200).json({
        contactUs: contactUs,
        pagination: { currentPage: page, totalPages, totalItems: count },
      });
    } else {
      return res.status(400).json({ error: error.message });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateContactUs = async (req, res) => {
  try {
    const { _id, name, email, mobileNo, message, subject } = req.body;

    const contactUs = {};

    if (subject != undefined) {
      contactUs.subject = subject;
    }
    if (mobileNo != undefined) {
      contactUs.mobileNo = mobileNo;
    }

    if (message != undefined) {
      contactUs.message = message;
    }

    if (name != undefined) {
      contactUs.name = name;
      contactUs.slug = slugify(name);
    }
    if (email != undefined) {
      contactUs.email = email;
    }

    const updatedContactUs = await ContactUs.findOneAndUpdate(
      { _id },
      contactUs,
      {
        new: true,
      }
    );
    return res.status(201).json({ updatedContactUs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
