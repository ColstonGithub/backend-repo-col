const ExploreCategory = require("../models/exploreCategory");
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

exports.createExploreCategory = async (req, res) => {
  try {
    const { imageTitle, imageAltText, categoryId } = req.body;
    const exploreCat = new ExploreCategory({
      imageTitle,
      imageAltText,
      categoryId,
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
      exploreCat.image = uploadedFile.Location;
    }

    exploreCat.save((error, expCat) => {
      if (error) return res.status(400).json({ error });
      if (expCat) {
        res.status(200).json({ exploreCategory: expCat, files: req.files });
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getExploreCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    if (id) {
      await ExploreCategory.findOne({ _id: id }).exec((error, expCat) => {
        if (error) return res.status(400).json({ error });
        if (expCat) {
          res.status(200).json({ exploreCategory: expCat });
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
exports.deleteExploreCategoryById = async (req, res) => {
  try {
    const { id } = req.body;
    if (id) {
      const response = await ExploreCategory.findOne({ _id: id });
      if (response) {
        let newBannerImage = response?.image.replace(
          "http://64.227.150.49:5000/public/",
          ""
        );
        const imagepath1 = path.join(__dirname, "../uploads", newBannerImage);
        fs.unlink(imagepath1, (error) => {
          if (error) {
            console.error(error);
          }
        });
        await ExploreCategory.deleteOne({ _id: id }).exec((error, result) => {
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

exports.getExploreCategory = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10; // Set a default of 10 items per page
  const page = parseInt(req.query.page) || 1; // Set a default page number of 1

  try {
    const expCat = await ExploreCategory.find({})
      .sort({ _id: -1 })
      .limit(limit)
      .skip(limit * page - limit);

    const count = await ExploreCategory.countDocuments().exec();
    const totalPages = Math.ceil(count / limit);

    if (expCat) {
      res.status(200).json({
        exploreCategory: expCat,
        pagination: { currentPage: page, totalPages, totalItems: count },
      });
    } else {
      return res.status(400).json({ error: error.message });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateExploreCategory = async (req, res) => {
  try {
    const { _id, imageTitle, imageAltText, categoryId } = req.body;

    const exploreCategory = {
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
      exploreCategory.image = uploadedFile.Location;
    }

    if (imageTitle != undefined) {
      exploreCategory.imageTitle = imageTitle;
    }
    if (imageAltText != undefined) {
      exploreCategory.imageAltText = imageAltText;
    }

    if (categoryId != undefined) {
      exploreCategory.categoryId = categoryId;
    }

    const updatedExploreCategory = await ExploreCategory.findOneAndUpdate(
      { _id },
      exploreCategory,
      {
        new: true,
      }
    );
    if (updatedExploreCategory) {
      return res.status(201).json({ updatedExploreCategory });
    } else {
      res.status(500).json({ error: error.message });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
