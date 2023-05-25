const BrandProduct = require("../models/brandProduct");
const shortid = require("shortid");
const slugify = require("slugify");
// let sortBy = require("lodash.sortby");
const path = require("path");
const fs = require("fs");
exports.addbrandProduct = (req, res) => {
  try {
    const brandObj = {
      title: req.body.title,
      slug: slugify(req.body.title),
      text: req.body.text,
      imageAltText: req.body.imageAltText,
      createdBy: req.user._id,
    };

    if (req.file) {
      brandObj.image = process.env.API + "/public/" + req.file.filename;
    }

    const brand = new BrandProduct(brandObj);

    brand.save((error, brandProd) => {
      if (error) return res.status(400).json({ error });
      if (brandProd) {
        return res.status(201).json({ brandProd });
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getbrandProductDetailsById = async (req, res) => {
  try {
    const { brandproductId } = req.params;
    if (brandproductId) {
      await BrandProduct.findOne({ _id: brandproductId }).exec(
        (error, brandproduct) => {
          if (error) return res.status(400).json({ error });
          res.status(200).json({ brandproduct });
        }
      );
    } else {
      return res.status(400).json({ error: "Params required" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// new update
exports.deletebrandProducttById = async (req, res) => {
  try {
    const { brandProductId } = req.body;
    if (brandProductId) {

      const response = await BrandProduct.findOne({ _id: brandProductId });

      if (response) {

        let newBannerImage = response?.image.replace(
          "http://64.227.150.49:5000/public/",
          ""
        );

        const imagepath1 = path.join(__dirname, "../uploads", newBannerImage);

        fs.unlink(imagepath1, (error) => {
          if (error) {
            console.error(error);
          }
        });

      await BrandProduct.deleteOne({ _id: brandProductId }).exec(
        (error, result) => {
          if (error) return res.status(400).json({ error });
          if (result) {
            res.status(202).json({ result, message: "Data has been deleted" });
          }
        }
      );
    }
    } else {
      res.status(400).json({ error: "Params required" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

function createProducts(products) {
  const productList = [];
  for (let prod of products) {
    productList.push({
      _id: prod._id,
      title: prod.title,
      text: prod.text,
      image: prod.image,
      imageAltText: prod.imageAltText,
      createdAt: prod.createdAt,
    });
  }

  return productList;
}

exports.getBrandProducts = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10; // Set a default of 10 items per page
  const page = parseInt(req.query.page) || 1; // Set a default page number of 1
  try {
    const brandProduct = await BrandProduct.find({}).sort({ _id: -1 })
      .limit(limit)
      .skip(limit * page - limit);

    const count = await BrandProduct.countDocuments().exec();
    const totalPages = Math.ceil(count / limit);
    const brandProducts = createProducts(brandProduct);
    if (brandProduct) {
      res.status(200).json({
        brandProducts,
        pagination: { currentPage: page, totalPages, totalItems: count },
      });
    } else {
      return res.status(400).json({ error: error.message });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateBrandProduct = async (req, res) => {
  try {
    const { _id, title, text, imageAltText } = req.body;

    let image = "";
    if (req.file) {
      image = process.env.API + "/public/" + req.file.filename;
    }
    const brandProduct = {
      title,
      text,
      imageAltText,
      slug: slugify(req.body.title),
    };
    if (image != "") {
      brandProduct.image = image;
    }
    const updatedProduct = await BrandProduct.findOneAndUpdate(
      { _id },
      brandProduct,
      {
        new: true,
      }
    );
    return res.status(201).json({ updatedProduct });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
