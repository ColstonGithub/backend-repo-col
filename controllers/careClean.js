const CareClean = require("../models/careClean");
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

exports.createCareClean = async (req, res) => {
  try {
    const { text, heading, bannerImageAltText, title } = req.body;

    const careCleanData = new CareClean({
      title,
      slug: slugify(title),
      heading,
      bannerImageAltText,
      text,
      createdBy: req.user._id,
    });

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
      careCleanData.bannerImage = uploadedFile.Location;
    }

    careCleanData.save((error, careClean) => {
      if (error) return res.status(400).json({ error });
      if (careClean) {
        res.status(200).json({ careCleanData: careClean, files: req.files });
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCareCleanById = async (req, res) => {
  try {
    const { id } = req.params;
    if (id) {
      await CareClean.findOne({ _id: id }).exec((error, careC) => {
        if (error) return res.status(400).json({ error });
        if (careC) {
          res.status(200).json({ CareClean: careC });
        }
      });
    } else {
      return res
        .status(400)
        .json({ error: `Params required ${error.message}` });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// new update
exports.deleteCareCleanById = async (req, res) => {
  try {
    const { id } = req.body;
    if (id) {
      const response = await CareClean.findOne({ _id: id });

      if (response) {
        // Delete the associated image data from DigitalOcean Spaces
        if (response.bannerImage) {
          const key = response.bannerImage.split("/").pop();
          const deleteParams = {
            Bucket: "colston-images", // Replace with your DigitalOcean Spaces bucket name
            Key: key,
          };

          await s3.deleteObject(deleteParams).promise();
        }
        await CareClean.deleteOne({ _id: id }).exec((error, result) => {
          if (error) return res.status(400).json({ error });
          if (result) {
            res
              .status(202)
              .json({ message: "Data has been deleted", result: result });
          }
        });
      }
    } else {
      res.status(400).json({ error: `Params required ${error.message}` });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCareCleans = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10; // Set a default of 10 items per page
  const page = parseInt(req.query.page) || 1; // Set a default page number of 1

  try {
    const careCleanData = await CareClean.find({})
      .sort({ _id: -1 })
      .limit(limit)
      .skip(limit * page - limit);

    const count = await CareClean.countDocuments().exec();
    const totalPages = Math.ceil(count / limit);

    if (careCleanData) {
      res.status(200).json({
        careCleanData,
        pagination: { currentPage: page, totalPages, totalItems: count },
      });
    } else {
      return res.status(400).json({ error: error.message });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCareClean = async (req, res) => {
  try {
    const { _id, text, heading, bannerImageAltText, title } = req.body;

    const careCleanData = {
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
      careCleanData.bannerImage = uploadedFile.Location;
    }

    if (text != undefined) {
      careCleanData.text = text;
    }

    if (heading != undefined) {
      careCleanData.heading = heading;
    }

    if (bannerImageAltText != undefined) {
      careCleanData.bannerImageAltText = bannerImageAltText;
    }

    if (title != undefined) {
      careCleanData.title = title;
      careCleanData.slug = slugify(title);
    }

    const updatedCareCleanData = await CareClean.findOneAndUpdate(
      { _id },
      careCleanData,
      {
        new: true,
      }
    );
    return res.status(201).json({ updatedCareCleanData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
