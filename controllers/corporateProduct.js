const CorporateProduct = require("../models/corporateProduct");
const slugify = require("slugify");
const c = require("config");
// let sortBy = require("lodash.sortby");
const path = require("path");
const fs = require("fs");
const shortid = require("shortid");

const AWS = require("aws-sdk");

const s3 = new AWS.S3({
  endpoint: new AWS.Endpoint("https://sgp1.digitaloceanspaces.com"), // Replace with your DigitalOcean Spaces endpoint
  accessKeyId: "DO00DRWTB9KLHRDV4HCB", // Replace with your DigitalOcean Spaces access key ID
  secretAccessKey: "W2Ar0764cy4Y7rsWCecsoZxOZ3mJTJoqxWBo+uppV/c", // Replace with your DigitalOcean Spaces secret access key
});

exports.addCorporateProduct = async (req, res) => {
  try {
    const corporateObj = {
      title: req.body.title,
      slug: slugify(req.body.title),
      text: req.body.text,
      imageAltText: req.body.imageAltText,
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
      corporateObj.image = uploadedFile.Location;
    }

    const corporate = new CorporateProduct(corporateObj);
    corporate.save((error, corporateProd) => {
      if (error) return res.status(400).json({ error });
      if (corporateProd) {
        return res.status(201).json({ corporateProd });
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCorporateProductDetailsById = async (req, res) => {
  try {
    const { id } = req.params;
    if (id) {
      await CorporateProduct.findOne({ _id: id }).exec(
        (error, corporateproduct) => {
          if (error) return res.status(400).json({ error });
          res.status(200).json({ corporateproduct });
        }
      );
    } else {
      return res.status(400).json({ error: "Params required" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteCorporateProductById = async (req, res) => {
  try {
    const { id } = req.body;
    if (id) {
      const response = await CorporateProduct.findOne({ _id: id });

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

        await CorporateProduct.deleteOne({ _id: id }).exec((error, result) => {
          if (error) return res.status(400).json({ error });
          if (result) {
            res.status(202).json({ result, message: "Data has been deleted" });
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
function createProducts(products) {
  const productList = [];
  for (let prod of products) {
    productList.push({
      _id: prod._id,
      title: prod.title,
      text: prod.text,
      imageAltText: prod.imageAltText,
      image: prod.image,
      createdAt: prod.createdAt,
      createdBy: prod.createdBy,
    });
  }

  return productList;
}
exports.getCorporateProducts = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10; // Set a default of 10 items per page
  const page = parseInt(req.query.page) || 1; // Set a default page number of 1

  try {
    const product = await CorporateProduct.find({})
      .sort({ _id: -1 })
      .limit(limit)
      .skip(limit * page - limit);

    const count = await CorporateProduct.countDocuments().exec();
    const totalPages = Math.ceil(count / limit);
    const corporateProducts = createProducts(product);

    if (product) {
      res.status(200).json({
        corporateProducts,
        pagination: { currentPage: page, totalPages, totalItems: count },
      });
    } else {
      return res.status(400).json({ error: error.message });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCorporateProduct = async (req, res) => {
  try {
    const { _id, title, text, imageAltText } = req.body;

    const corporateProduct = {};

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
      corporateProduct.image = uploadedFile.Location;
    }

    if (title) {
      corporateProduct.title = title;
      corporateProduct.slug = slugify(req.body.title);
    }
    if (text) {
      corporateProduct.text = text;
    }
    if (imageAltText) {
      corporateProduct.imageAltText = imageAltText;
    }

    const updatedProduct = await CorporateProduct.findOneAndUpdate(
      { _id },
      corporateProduct,
      {
        new: true,
      }
    );
    return res.status(201).json({ updatedProduct });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
