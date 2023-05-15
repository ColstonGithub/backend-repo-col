const VirtualTour = require("../models/virtualTour");
const shortid = require("shortid");
const slugify = require("slugify");

exports.createVirtualTour = (req, res) => {
  try {
    const { title, bannerImageAltText, bannerImageTextAltText } = req.body;

    const bannerImage = req.files["bannerImage"]
      ? req.files["bannerImage"][0].location
      : undefined;

    const bannerImageText = req.files["bannerImageText"]
      ? req.files["bannerImageText"][0].location
      : undefined;

    const PageBanner = new VirtualTour({
      title,
      slug: slugify(title),
      bannerImage,
      bannerImageText,
      bannerImageAltText,
      bannerImageTextAltText,
      createdBy: req.user._id,
    });

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

exports.getVirtualTourById = async (req, res) => {
  try {
    const { id } = req.params;
    if (id) {
      await VirtualTour.findOne({ _id: id }).exec((error, banner) => {
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
exports.deleteVirtualTourById = async (req, res) => {
  try {
    const { id } = req.body;
    if (id) {
      await VirtualTour.deleteOne({ _id: id }).exec((error, result) => {
        if (error) return res.status(400).json({ error });
        if (result) {
          res
            .status(202)
            .json({ message: "Data has been deleted", result: result });
        }
      });
    } else {
      res.status(400).json({ error: `Params required ${error.message}` });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getVirtualTours = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10; // Set a default of 10 items per page
  const page = parseInt(req.query.page) || 1; // Set a default page number of 1

  try {
    const PageBanner = await VirtualTour.find({}).sort({ _id: -1 })
      .limit(limit)
      .skip(limit * page - limit);

    const count = await VirtualTour.countDocuments().exec();
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

exports.updateVirtualTour = async (req, res) => {
  try {
    const {
      _id,
      title,
      buttonText,
      bannerImageAltText,
      bannerImageTextAltText,
    } = req.body;

    const bannerImage = req.files["bannerImage"]
      ? req.files["bannerImage"][0].location
      : undefined;
    const bannerImageText = req.files["bannerImageText"]
      ? req.files["bannerImageText"][0].location
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

    const updatedBanner = await VirtualTour.findOneAndUpdate(
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
