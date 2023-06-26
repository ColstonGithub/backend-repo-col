const Career = require("../models/career");
const shortid = require("shortid");
const slugify = require("slugify");
const path = require("path");
const fs = require("fs");

const AWS = require("aws-sdk");

const s3 = new AWS.S3({
  endpoint: new AWS.Endpoint("https://sgp1.digitaloceanspaces.com"), // Replace with your DigitalOcean Spaces endpoint
  accessKeyId: "DO00DRWTB9KLHRDV4HCB", // Replace with your DigitalOcean Spaces access key ID
  secretAccessKey: "W2Ar0764cy4Y7rsWCecsoZxOZ3mJTJoqxWBo+uppV/c", // Replace with your DigitalOcean Spaces secret access key
});

exports.createCareer = async (req, res) => {
  try {
    const { name, email, subject, mobileNo, message } = req.body;

    let pdf;

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
      pdf = uploadedFile.Location;
    }

    const careerData = new Career({
      name,
      slug: slugify(name),
      email,
      mobileNo,
      subject,
      pdf,
      message,
      // createdBy: req.user._id,
    });
    careerData.save((error, career) => {
      if (error) return res.status(400).json({ error });
      if (career) {
        res.status(200).json({ careerData: career, files: req.file });
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCareerById = async (req, res) => {
  try {
    const { id } = req.params;
    if (id) {
      await Career.findOne({ _id: id }).exec((error, career) => {
        if (error) return res.status(400).json({ error });
        if (career) {
          res.status(200).json({ careerData: career });
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
exports.deleteCareerById = async (req, res) => {
  try {
    const { id } = req.body;
    if (id) {
      const response = await Career.findOne({ _id: id });

      if (response) {
        // Delete the associated image data from DigitalOcean Spaces
        if (response.pdf) {
          const key = response.pdf.split("/").pop();
          const deleteParams = {
            Bucket: "colston-images", // Replace with your DigitalOcean Spaces bucket name
            Key: key,
          };
    
          await s3.deleteObject(deleteParams).promise();
        }

        await Career.deleteOne({ _id: id }).exec((error, result) => {
          if (error) return res.status(400).json({ error });
          if (result) {
            res.status(202).json({ result });
          }
        });
      }
    } else {
      res.status(400).json({ error: "Params required" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCareer = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10; // Set a default of 10 items per page
  const page = parseInt(req.query.page) || 1; // Set a default page number of 1

  try {
    const careerData = await Career.find({})
      .sort({ _id: -1 })
      .limit(limit)
      .skip(limit * page - limit);

    const count = await Career.countDocuments().exec();
    const totalPages = Math.ceil(count / limit);

    if (careerData) {
      res.status(200).json({
        careerData: careerData,
        pagination: { currentPage: page, totalPages, totalItems: count },
      });
    } else {
      return res.status(400).json({ error: error.message });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCareer = async (req, res) => {
  try {
    const { _id, name, email, mobileNo, message, subject } = req.body;

    const careerData = {
      createdBy: req.user._id,
    };

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
      careerData.pdf = uploadedFile.Location;
    }

    if (subject != undefined) {
      careerData.subject = subject;
    }
    if (mobileNo != undefined) {
      careerData.mobileNo = mobileNo;
    }

    if (message != undefined) {
      careerData.message = message;
    }

    if (name != undefined) {
      careerData.name = name;
      careerData.slug = slugify(name);
    }
    if (email != undefined) {
      careerData.email = email;
    }

    const updatedCareer = await Career.findOneAndUpdate({ _id }, careerData, {
      new: true,
    });
    return res.status(201).json({ updatedCareer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
