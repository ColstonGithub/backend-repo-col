const Slider = require("../models/slider");
const shortid = require("shortid");
const slugify = require("slugify");
const path = require("path");
const fs = require("fs");
exports.createSlider = (req, res) => {
  const { title, createdBy } = req.body;

  let sliders = [];

  if (req.files.length > 0) {
    sliders = req.files.map((file) => {
      return { img: process.env.API + "/public/" + file.filename };
    });
  }

  const slider = new Slider({
    title: title,
    slug: slugify(title),
    sliders,
    createdBy: req.user._id,
  });
  slider.save((error, slider) => {
    if (error) return res.status(400).json({ error });
    if (slider) {
      res.status(201).json({ slider, files: req.files });
    }
  });
};

exports.getSlidersBySlug = (req, res) => {
  const { slug } = req.params;
  //console.log(slug)
  Slider.findOne({ slug: slug })
    .select("_id sliders title slug")
    .exec((error, slider) => {
      if (error) {
        return res.status(400).json({ error });
      } else {
        res.status(200).json({ slider });
      }
    });
};

exports.getSliderById = (req, res) => {
  const { sliderId } = req.params;
  if (sliderId) {
    Slider.findOne({ _id: sliderId }).exec((error, slider) => {
      if (error) return res.status(400).json({ error });
      if (slider) {
        res.status(200).json({ slider });
      }
    });
  } else {
    return res.status(400).json({ error: "Params required" });
  }
};

// new update
exports.deleteSliderById = async (req, res) => {
  const { sliderId } = req.body.payload;
  if (sliderId) {
    const response = await Slider.findOne({ _id: sliderId });

    if (response) {
      response.sliders.forEach(async (banner) => {
        if (banner.img) {
          const key = banner.img.split("/").pop();
          const deleteParams = {
            Bucket: "colston-images", // Replace with your DigitalOcean Spaces bucket name
            Key: key,
          };

          await s3.deleteObject(deleteParams).promise();
        }
      });

      Slider.deleteOne({ _id: sliderId }).exec((error, result) => {
        if (error) return res.status(400).json({ error });
        if (result) {
          res.status(202).json({ result });
        }
      });
    }
  } else {
    res.status(400).json({ error: "Params required" });
  }
};

exports.getSliders = async (req, res) => {
  const sliders = await Slider.find({ createdBy: req.user._id });
  // .select("_id title Sliders")
  // // .populate({ path: "category", select: "_id name" })
  // .exec();

  res.status(200).json({ sliders });
};
