const CategoryBanner = require("../models/categoryBanner");
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

exports.createCategoryBanner = async (req, res) => {
  try {
    const { title, bannerImageAltText, categoryId } = req.body;

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

    const catbanner = new CategoryBanner({
      title,
      slug: slugify(title),
      bannerImage,
      bannerImageAltText,
      categoryId,
      createdBy: req.user._id,
    });

    catbanner.save((error, catban) => {
      if (error) return res.status(400).json({ error });
      if (catban) {
        res.status(200).json({ categoryBanner: catban, files: req.files });
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCategoryBannersBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    await CategoryBanner.findOne({ slug: slug })
      .select("_id categoryId bannerImage title slug")
      .exec((error, categorybanner) => {
        if (error) {
          return res.status(400).json({ error });
        } else {
          res.status(200).json({ categorybanner });
        }
      });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCategoryBannerById = async (req, res) => {
  try {
    const { id } = req.params;
    if (id) {
      await CategoryBanner.findOne({ _id: id }).exec((error, banner) => {
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
exports.deleteCategoryBannerById = async (req, res) => {
  try {
    const { id } = req.body;
    if (id) {
      const response = await CategoryBanner.findOne({ _id: id });

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

        await CategoryBanner.deleteOne({ _id: id }).exec((error, result) => {
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

exports.getCategoryBanners = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10; // Set a default of 10 items per page
  const page = parseInt(req.query.page) || 1; // Set a default page number of 1

  try {
    const Catbanner = await CategoryBanner.find({})
      .sort({ _id: -1 })
      .limit(limit)
      .skip(limit * page - limit);

    const count = await CategoryBanner.countDocuments().exec();
    const totalPages = Math.ceil(count / limit);

    if (Catbanner) {
      res.status(200).json({
        CategoryBanner: Catbanner,
        pagination: { currentPage: page, totalPages, totalItems: count },
      });
    } else {
      return res.status(400).json({ error: error.message });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCategoryBanner = async (req, res) => {
  try {
    const { _id, title, bannerImageAltText, categoryId } = req.body;

    const categoryBanner = {
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
      categoryBanner.bannerImage = uploadedFile.Location;
    }

    if (bannerImageAltText != undefined) {
      categoryBanner.bannerImageAltText = bannerImageAltText;
    }

    if (title != undefined) {
      categoryBanner.title = title;
      categoryBanner.slug = slugify(title);
    }
    if (categoryId != undefined) {
      categoryBanner.categoryId = categoryId;
    }

    const updatedCategoryBanner = await CategoryBanner.findOneAndUpdate(
      { _id },
      categoryBanner,
      {
        new: true,
      }
    );
    return res.status(201).json({ updatedCategoryBanner });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
