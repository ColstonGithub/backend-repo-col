const BrandPageBanner = require("../models/brandPageBanner");
const shortid = require("shortid");
const slugify = require("slugify");
const fs = require("fs");
const path = require("path");
const AWS = require("aws-sdk");

const s3 = new AWS.S3({
  endpoint: new AWS.Endpoint("https://sgp1.digitaloceanspaces.com"), // Replace with your DigitalOcean Spaces endpoint
  accessKeyId: "DO00DRWTB9KLHRDV4HCB", // Replace with your DigitalOcean Spaces access key ID
  secretAccessKey: "W2Ar0764cy4Y7rsWCecsoZxOZ3mJTJoqxWBo+uppV/c", // Replace with your DigitalOcean Spaces secret access key
});

exports.createBrandPageBanner = async (req, res) => {
  try {
    const { title, bannerImageAltText } = req.body;

    let bannerImage = "";
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
      bannerImage = uploadedFile.Location;
    }

    const brandPageBanner = new BrandPageBanner({
      title,
      slug: slugify(title),
      bannerImage,
      bannerImageAltText,
      createdBy: req.user._id,
    });

    brandPageBanner.save((error, banner) => {
      if (error) return res.status(400).json({ error });
      if (banner) {
        res.status(200).json({ PageBanner: banner, files: req.files });
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getBrandPageBannerById = async (req, res) => {
  try {
    const { id } = req.params;
    if (id) {
      await BrandPageBanner.findOne({ _id: id }).exec((error, banner) => {
        if (error) return res.status(400).json({ error });
        if (banner) {
          res.status(200).json({ banner });
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
exports.deleteBrandPageBannerById = async (req, res) => {
  try {
    const { id } = req.body;
    if (id) {
      const response = await BrandPageBanner.findOne({ _id: id });

      if (response) {
        let newBannerImage = response?.bannerImage.replace(
          "http://64.227.150.49:5000/public/",
          ""
        );

        const imagepath1 = path.join(__dirname, "../uploads", newBannerImage);

        fs.unlink(imagepath1, (error) => {
          if (error) {
            console.error(error);
          }
        });

        await BrandPageBanner.deleteOne({ _id: id }).exec((error, result) => {
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

exports.getBrandPageBanners = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10; // Set a default of 10 items per page
  const page = parseInt(req.query.page) || 1; // Set a default page number of 1

  try {
    const PageBanner = await BrandPageBanner.find({})
      .sort({ _id: -1 })
      .limit(limit)
      .skip(limit * page - limit);

    const count = await BrandPageBanner.countDocuments().exec();
    const totalPages = Math.ceil(count / limit);

    if (PageBanner) {
      res.status(200).json({
        PageBanner,
        pagination: { currentPage: page, totalPages, totalItems: count },
      });
    } else {
      return res.status(400).json({ error: error.message });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateBrandPageBanner = async (req, res) => {
  try {
    const { _id, title, bannerImageAltText } = req.body;

    const pageBanner = {
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
      pageBanner.bannerImage = uploadedFile.Location;
    }
    if (bannerImageAltText != undefined) {
      pageBanner.bannerImageAltText = bannerImageAltText;
    }

    if (title != undefined) {
      pageBanner.title = title;
      pageBanner.slug = slugify(title);
    }

    const updatedBanner = await BrandPageBanner.findOneAndUpdate(
      { _id },
      pageBanner,
      {
        new: true,
      }
    );
    return res.status(201).json({ updatedBanner });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
