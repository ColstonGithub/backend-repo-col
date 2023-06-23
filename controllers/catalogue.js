const Catalogue = require("../models/catalogue");
const slugify = require("slugify");
// let sortBy = require("lodash.sortby");
const path = require("path");
const fs = require("fs");
exports.addCatalogue = (req, res) => {
  try {
    const catalogueObj = {
      title: req.body.title,
      slug: slugify(req.body.title),
      imageAltText: req.body.imageAltText,
      createdBy: req.user._id,
    };

    const pdf = req.files["pdf"]
      ? process.env.API + "/public/" + req.files["pdf"][0].filename
      : undefined;

    const image = req.files["image"]
      ? process.env.API + "/public/" + req.files["image"][0].filename
      : undefined;

    if (pdf && pdf != undefined) {
      catalogueObj.pdf = pdf;
    }

    if (image && image != undefined) {
      catalogueObj.image = image;
    }
    const catalogue = new Catalogue(catalogueObj);

    catalogue.save((error, catalog) => {
      if (error) return res.status(400).json({ error: error.message });
      if (catalog) {
        return res.status(201).json({ catalogue: catalog });
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCatalogueDetailsById = async (req, res) => {
  try {
    const { id } = req.params;
    if (id) {
      await Catalogue.findOne({ _id: id }).exec((error, catalog) => {
        if (error) return res.status(400).json({ error: error.message });
        res.status(200).json({ Catalogue: catalog });
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

exports.deleteCatalogueById = async (req, res) => {
  try {
    const { id } = req.body;
    if (id) {
      const response = await Catalogue.findOne({ _id: id });

      if (response) {
        let newBannerImage = response?.image.replace(
          "http://localhost:5000/public/",
          ""
        );
        let pdf = response?.pdf.replace(
          "http://localhost:5000/public/",
          ""
        );
        const imagepath1 = path.join(__dirname, "../uploads", newBannerImage);
        const imagepath2 = path.join(__dirname, "../uploads", pdf);
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

        await Catalogue.deleteOne({ _id: id }).exec((error, result) => {
          if (error) return res.status(400).json({ error });
          if (result) {
            res.status(202).json({ message: "Data has been deleted", result });
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

function createCatalogue(catlog) {
  const CatalogueList = [];
  for (let prod of catlog) {
    CatalogueList.push({
      _id: prod._id,
      title: prod.title,
      pdf: prod.pdf,
      imageAltText: prod.imageAltText,
      image: prod.image,
      createdAt: prod.createdAt,
      createdBy: prod.createdBy,
    });
  }

  return CatalogueList;
}

exports.getCatalogue = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10; // Set a default of 10 items per page
    const page = parseInt(req.query.page) || 1; // Set a default page number of 1

    const catlog = await Catalogue.find({})
      .sort({ _id: -1 })
      .limit(limit)
      .skip(limit * page - limit);

    const count = await Catalogue.countDocuments().exec();
    const totalPages = Math.ceil(count / limit);
    const catalogueList = createCatalogue(catlog);

    if (catlog) {
      res.status(200).json({
        catalogueList,
        pagination: { currentPage: page, totalPages, totalItems: count },
      });
    } else {
      return res.status(400).json({ error: error.message });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCatalogue = async (req, res) => {
  try {
    const { _id, title, imageAltText } = req.body;

    const catalogue = {};

    const pdf = req.files["pdf"]
      ? process.env.API + "/public/" + req.files["pdf"][0].filename
      : undefined;

    const catImage = req.files["image"]
      ? process.env.API + "/public/" + req.files["image"][0].filename
      : undefined;

    if (pdf != undefined && pdf != "") {
      catalogue.pdf = pdf;
    }

    if (title != undefined && title != "") {
      catalogue.title = title;
      catalogue.slug = slugify(req.body.title);
    }
    if (catImage != undefined && catImage != "") {
      catalogue.image = catImage;
    }

    if (imageAltText != undefined && imageAltText != "") {
      catalogue.imageAltText = imageAltText;
    }

    const updatedProduct = await Catalogue.findOneAndUpdate(
      { _id },
      catalogue,
      {
        new: true,
      }
    );
    return res.status(201).json({ updatedProduct });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
