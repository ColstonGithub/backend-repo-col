const Banner = require("../models/homepageBanner");
const shortid = require("shortid");
const slugify = require("slugify");
const path = require("path");
const fs = require("fs");
exports.createBanner = (req, res) => {
  try {
    const { title, imageAltText } = req.body;

    const banner = req.file
      ? process.env.API + "/public/" + req.file.filename
      : undefined;

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
        let newBannerImage = response?.banner.replace(
          "http://localhost:5000/public/",
          ""
        );
        const imagePath1 = path.join(__dirname, "../uploads", newBannerImage);

        fs.unlink(imagePath1, (error) => {
          if (error) {
            console.error(`Error deleting image file: ${error}`);
          } else {
            console.log(`Image file ${imagePath1} deleted successfully.`);
          }
        });

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

    const banner = req.file
      ? process.env.API + "/public/" + req.file.filename
      : undefined;

    const bannerData = {
      createdBy: req.user._id,
    };
    if (title != undefined) {
      bannerData.title = title;
      bannerData.slug = slugify(title);
    }
    if (banner != undefined) {
      bannerData.banner = banner;
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
