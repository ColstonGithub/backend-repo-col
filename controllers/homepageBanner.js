const Banner = require("../models/homepageBanner");
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

exports.createBanner = async (req, res) => {
  try {
    const { title, imageAltText } = req.body;

    let banner = "";
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
      banner = uploadedFile.Location;
    }

    const bannerData = new Banner({
      title: title,
      slug: slugify(title),
      banner,
      imageAltText,
      createdBy: req.user._id,
    });
    bannerData.save((error, bannerImage) => {
      if (error) return res.status(400).json({ message: error.message });
      if (bannerImage) {
        res.status(201).json({ banners: bannerImage, files: req.files });
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getBannersBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    //console.log(slug)
    await Banner.findOne({ slug: slug })
      .select("_id banners title slug type")
      .exec((error, banner) => {
        if (error) {
          return res.status(400).json({ error });
        } else {
          res.status(200).json({ banner });
        }
      });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getBannerById = (req, res) => {
  try {
    const { id } = req.params;
    if (id) {
      Banner.findOne({ _id: id }).exec((error, banner) => {
        if (error) return res.status(400).json({ error });
        if (banner) {
          res.status(200).json({ banner });
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
exports.deleteBannerById = async (req, res) => {
  try {
    const { bannerId } = req.body;
    if (bannerId) {
      const response = await Banner.findOne({ _id: bannerId });

      if (response) {
        if (response.banner) {
          const key = response.banner.split("/").pop();
          const deleteParams = {
            Bucket: "colston-images", // Replace with your DigitalOcean Spaces bucket name
            Key: key,
          };

          await s3.deleteObject(deleteParams).promise();
        }


        Banner.deleteOne({ _id: bannerId }).exec((error, result) => {
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

exports.getBanners = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10; // Set a default of 10 items per page
  const page = parseInt(req.query.page) || 1; // Set a default page number of 1

  try {
    const homepageBanner = await Banner.find({})
      .sort({ _id: -1 })
      .limit(limit)
      .skip(limit * page - limit);

    const count = await Banner.countDocuments().exec();
    const totalPages = Math.ceil(count / limit);

    if (homepageBanner) {
      res.status(200).json({
        homepageBanner,
        pagination: { currentPage: page, totalPages, totalItems: count },
      });
    } else {
      return res.status(400).json({ error: error.message });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateBanner = async (req, res) => {
  try {
    const { _id, title, imageAltText } = req.body;

    const bannerData = {
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
      bannerData.banner = uploadedFile.Location;
    }

    if (title != undefined) {
      bannerData.title = title;
      bannerData.slug = slugify(title);
    }

    if (imageAltText != undefined) {
      bannerData.imageAltText = imageAltText;
    }
    const updatedBanner = await Banner.findOneAndUpdate({ _id }, bannerData, {
      new: true,
    });
    return res.status(201).json({ updatedBanner });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
