const CorporatePageBanner = require("../models/corporatePageBanner");
const shortid = require("shortid");
const slugify = require("slugify");
const path = require("path");
const fs = require("fs");
exports.createCorporatePageBanner = (req, res) => {
  try {
    const { title, bannerImageAltText, bannerImageTextAltText } = req.body;

    const bannerImage = req.files["bannerImage"]
      ? process.env.API + "/public/" + req.files["bannerImage"][0].filename
      : undefined;

    const PageBanner = new CorporatePageBanner({
      title,
      slug: slugify(title),
      createdBy: req.user._id,
    });

    if (bannerImageAltText != undefined) {
      PageBanner.bannerImageAltText = bannerImageAltText;
    }
    if (bannerImageTextAltText != undefined) {
      PageBanner.bannerImageTextAltText = bannerImageTextAltText;
    }
    if (bannerImageText != undefined) {
      PageBanner.bannerImageText = bannerImageText;
    }
    if (bannerImage != undefined) {
      PageBanner.bannerImage = bannerImage;
    }
    PageBanner.save((error, banner) => {
      if (error) return res.status(400).json({ error });
      if (banner) {
        res.status(200).json({ PageBanner: banner, files: req.files });
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCorporatePageBannerById = async (req, res) => {
  try {
    const { id } = req.params;
    if (id) {
      await CorporatePageBanner.findOne({ _id: id }).exec((error, banner) => {
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
exports.deleteCorporatePageBannerById = async (req, res) => {
  try {
    const { id } = req.body;
    if (id) {
      const response = await CorporatePageBanner.findOne({ _id: id });

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

        await CorporatePageBanner.deleteOne({ _id: id }).exec(
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

exports.getCorporatePageBanners = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10; // Set a default of 10 items per page
  const page = parseInt(req.query.page) || 1; // Set a default page number of 1

  try {
    const PageBanner = await CorporatePageBanner.find({})
      .sort({ _id: -1 })
      .limit(limit)
      .skip(limit * page - limit);

    const count = await CorporatePageBanner.countDocuments().exec();
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

exports.updateCorporatePageBanner = async (req, res) => {
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
      ? process.env.API + "/public/" + req.files["bannerImageText"][0].filename
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

    const updatedBanner = await CorporatePageBanner.findOneAndUpdate(
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
