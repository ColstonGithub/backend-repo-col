const CataloguePageBanner = require("../models/cataloguePageBanner");
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

exports.createCataloguePageBanner = (req, res) => {
  try {
    const { title, bannerImageAltText, bannerImageTextAltText } = req.body;

    const bannerImage = req.files["bannerImage"]
      ? process.env.API + "/public/" + req.files["bannerImage"][0].filename
      : undefined;

    const bannerImageText = req.files["bannerImageText"]
      ? process.env.API + "/public/" + req.files["bannerImage"][0].filename
      : undefined;

    const cataloguePageBanner = new CataloguePageBanner({
      title,
      slug: slugify(title),
      bannerImage,
      bannerImageAltText,
      createdBy: req.user._id,
    });
    if (bannerImageTextAltText != undefined) {
      cataloguePageBanner.bannerImageTextAltText = bannerImageTextAltText;
    }
    if (bannerImageText != undefined) {
      cataloguePageBanner.bannerImageText = bannerImageText;
    }
    if (bannerImage != undefined) {
      cataloguePageBanner.bannerImage = bannerImage;
    }
    if (bannerImageAltText != undefined) {
      cataloguePageBanner.bannerImageAltText = bannerImageAltText;
    }
    cataloguePageBanner.save((error, banner) => {
      if (error) return res.status(400).json({ error });
      if (banner) {
        res.status(200).json({ PageBanner: banner, files: req.files });
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCataloguePageBannerById = async (req, res) => {
  try {
    const { id } = req.params;
    if (id) {
      await CataloguePageBanner.findOne({ _id: id }).exec((error, banner) => {
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
exports.deleteCataloguePageBannerById = async (req, res) => {
  try {
    const { id } = req.body;
    if (id) {
      const response = await CataloguePageBanner.findOne({ _id: id });

      if (response) {
        let newBannerImage = response?.bannerImage.replace(
          "http://64.227.150.49:5000/public/",
          ""
        );
        let newBannerImageText = response?.bannerImageText.replace(
          "http://64.227.150.49:5000/public/",
          ""
        );

        const imagepath1 = path.join(__dirname, "../uploads", newBannerImage);
        const imagepath2 = path.join(
          __dirname,
          "../uploads",
          newBannerImageText
        );
        fs.unlink(imagepath1, (error) => {
          if (error) {
            console.error(error);
          }
        });
        fs.unlink(imagepath2, (error) => {
          if (error) {
            console.error(error);
          }
        });

        await CataloguePageBanner.deleteOne({ _id: id }).exec(
          (error, result) => {
            if (error) return res.status(400).json({ error });
            if (result) {
              res
                .status(202)
                .json({ message: "Data has been deleted", result: result });
            }
          }
        );
      }
    } else {
      res.status(400).json({ error: `Params required ${error.message}` });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCataloguePageBanners = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10; // Set a default of 10 items per page
  const page = parseInt(req.query.page) || 1; // Set a default page number of 1

  try {
    const PageBanner = await CataloguePageBanner.find({})
      .sort({ _id: -1 })
      .limit(limit)
      .skip(limit * page - limit);

    const count = await CataloguePageBanner.countDocuments().exec();
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

exports.updateCataloguePageBanner = async (req, res) => {
  try {
    const {
      _id,
      title,
      buttonText,
      bannerImageAltText,
      bannerImageTextAltText,
    } = req.body;

    const bannerImage = req.files["bannerImage"]
      ? process.env.API + "/public/" + req.files["bannerImage"][0].filename
      : undefined;

    const bannerImageText = req.files["bannerImageText"]
      ? process.env.API + "/public/" + req.files["bannerImage"][0].filename
      : undefined;

    const pageBanner = {
      createdBy: req.user._id,
    };
    if (bannerImageText != undefined) {
      pageBanner.bannerImageText = bannerImageText;
    }
    if (bannerImage != undefined) {
      pageBanner.bannerImage = bannerImage;
    }
    if (bannerImageAltText != undefined) {
      pageBanner.bannerImageAltText = bannerImageAltText;
    }
    if (bannerImageTextAltText != undefined) {
      pageBanner.bannerImageTextAltText = bannerImageTextAltText;
    }

    if (buttonText != undefined) {
      pageBanner.buttonText = buttonText;
    }

    if (title != undefined) {
      pageBanner.title = title;
      pageBanner.slug = slugify(title);
    }

    const updatedBanner = await CataloguePageBanner.findOneAndUpdate(
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
