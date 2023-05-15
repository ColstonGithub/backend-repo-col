const Banner = require("../models/homepageBanner");
const shortid = require("shortid");
const slugify = require("slugify");

exports.createBanner = (req, res) => {
  try {
    const { title } = req.body;

    let banners = [];

    if (req.files) {
      banners = req.files.map((file, index) => {
        return {
          img: file.location,
          imageAltText: req.body.imageAltText[index],
        };
      });
    }

    const banner = new Banner({
      title: title,
      slug: slugify(title),
      banners,
      createdBy: req.user._id,
    });
    banner.save((error, ban) => {
      if (error) return res.status(400).json({ message: error.message });
      if (ban) {
        res.status(201).json({ banner: ban, files: req.files });
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
exports.deleteBannerById = (req, res) => {
  try {
    const { bannerId } = req.body;
    if (bannerId) {
      Banner.deleteOne({ _id: bannerId }).exec((error, result) => {
        if (error) return res.status(400).json({ error });
        if (result) {
          res.status(202).json({ result });
        }
      });
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
    const homepageBanner = await Banner.find({}).sort({ _id: -1 })
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
    const { _id, title } = req.body;
    let banners = [];

    if (req.files) {
      banners = req.files.map((file, index) => {
        return {
          img: file.location,
          imageAltText: req.body.imageAltText[index],
        };
      });
    }
    const banner = {
      title,
      slug: slugify(title),
      createdBy: req.user._id,
    };
    if (banners.length > 0) {
      banner.banners = banners;
    }
    const updatedBanner = await Banner.findOneAndUpdate({ _id }, banner, {
      new: true,
    });
    return res.status(201).json({ updatedBanner });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
