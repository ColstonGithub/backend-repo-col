const WarrentyRegistration = require("../models/warrentyRegistration");
const shortid = require("shortid");
const slugify = require("slugify");
const bcrypt = require("bcrypt");
const AWS = require("aws-sdk");

const s3 = new AWS.S3({
  endpoint: new AWS.Endpoint("https://sgp1.digitaloceanspaces.com"), // Replace with your DigitalOcean Spaces endpoint
  accessKeyId: "DO00DRWTB9KLHRDV4HCB", // Replace with your DigitalOcean Spaces access key ID
  secretAccessKey: "W2Ar0764cy4Y7rsWCecsoZxOZ3mJTJoqxWBo+uppV/c", // Replace with your DigitalOcean Spaces secret access key
});

exports.createWarrentyRegistration = async (req, res) => {
  try {
    const { name, email, subject, mobileNo } = req.body;

    let image;

    if (req.file) {
      const fileContent = req.file.buffer;
      const filename = shortid.generate() + "-" + req.file.originalname;
      const uploadParams = {
        Bucket: "colston-images", // Replace with your DigitalOcean Spaces bucket name
        Key: filename,
        Body: fileContent,
        ACL: "public-read",
      };

      // Upload the file to DigitalOcean Spaces
      const uploadedFile = await s3.upload(uploadParams).promise();

      // Set the image URL in the bannerImage variable
      image = uploadedFile.Location;
    }

    const warrentyRegistration = new WarrentyRegistration({
      name,
      slug: slugify(name),
      email,
      image,
      mobileNo,
      subject,
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
      const response = await WarrentyRegistration.findOne({ _id: id });

      if (response) {
        if (response.image) {
          const key = response.image.split("/").pop();
          const deleteParams = {
            Bucket: "colston-images", // Replace with your DigitalOcean Spaces bucket name
            Key: key,
          };

          await s3.deleteObject(deleteParams).promise();
        }

        await WarrentyRegistration.deleteOne({ _id: id }).exec(
          (error, result) => {
            if (error) return res.status(400).json({ error });
            if (result) {
              res.status(202).json({ result });
            }
          }
        );
      }
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
    const { _id, name, email, mobileNo, subject } = req.body;

    const warrentyReg = {
      // createdBy: req.user._id,
    };

    let image;

    if (req.file) {
      const fileContent = req.file.buffer;
      const filename = shortid.generate() + "-" + req.file.originalname;
      const uploadParams = {
        Bucket: "colston-images", // Replace with your DigitalOcean Spaces bucket name
        Key: filename,
        Body: fileContent,
        ACL: "public-read",
      };

      // Upload the file to DigitalOcean Spaces
      const uploadedFile = await s3.upload(uploadParams).promise();

      // Set the image URL in the bannerImage variable
      image = uploadedFile.Location;
    }

    if (subject != undefined) {
      warrentyReg.subject = subject;
    }
    if (mobileNo != undefined) {
      warrentyReg.mobileNo = mobileNo;
    }

    if (image != undefined) {
      warrentyReg.image = image;
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
