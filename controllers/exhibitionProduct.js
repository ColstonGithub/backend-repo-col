const ExhibitionProduct = require("../models/exhibitionProduct");
const shortid = require("shortid");
const slugify = require("slugify");
// let sortBy = require("lodash.sortby");
const AWS = require("aws-sdk");

const s3 = new AWS.S3({
  endpoint: new AWS.Endpoint("https://sgp1.digitaloceanspaces.com"), // Replace with your DigitalOcean Spaces endpoint
  accessKeyId: "DO00DRWTB9KLHRDV4HCB", // Replace with your DigitalOcean Spaces access key ID
  secretAccessKey: "W2Ar0764cy4Y7rsWCecsoZxOZ3mJTJoqxWBo+uppV/c", // Replace with your DigitalOcean Spaces secret access key
});

exports.addExhibitionProduct = async (req, res) => {
  try {
    const exhibitionObj = {
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
      exhibitionObj.image = uploadedFile.Location;
    }

    const exhibition = new ExhibitionProduct(exhibitionObj);

    exhibition.save((error, exhibitionProd) => {
      if (error) return res.status(400).json({ error });
      if (exhibitionProd) {
        return res.status(201).json({ exhibitionProd });
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getExhibitionProductDetailsById = async (req, res) => {
  try {
    const { exhibitionproductId } = req.params;
    if (exhibitionproductId) {
      await ExhibitionProduct.findOne({ _id: exhibitionproductId }).exec(
        (error, exhibitionproduct) => {
          if (error) return res.status(400).json({ error });
          res.status(200).json({ exhibitionproduct });
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
exports.deleteExhibitionProducttById = async (req, res) => {
  try {
    const { exhibitionProductId } = req.body;
    if (exhibitionProductId) {
      const response = await ExhibitionProduct.findOne({
        _id: exhibitionProductId,
      });

      if (response) {
        // Delete the associated image data from DigitalOcean Spaces
        if (response.image) {
          const key = response.image.split("/").pop();
          const deleteParams = {
            Bucket: "colston-images", // Replace with your DigitalOcean Spaces bucket name
            Key: key,
          };

          await s3.deleteObject(deleteParams).promise();
        }
        await ExhibitionProduct.deleteOne({ _id: exhibitionProductId }).exec(
          (error, result) => {
            if (error) return res.status(400).json({ error });
            if (result) {
              res
                .status(202)
                .json({ result, message: "Data has been deleted" });
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

exports.getExhibitionProducts = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10; // Set a default of 10 items per page
  const page = parseInt(req.query.page) || 1; // Set a default page number of 1
  try {
    const exhibitionProduct = await ExhibitionProduct.find({})
      .sort({ _id: -1 })
      .limit(limit)
      .skip(limit * page - limit);

    const count = await ExhibitionProduct.countDocuments().exec();
    const totalPages = Math.ceil(count / limit);
    const exhibitionProducts = createProducts(exhibitionProduct);
    if (exhibitionProduct) {
      res.status(200).json({
        exhibitionProducts,
        pagination: { currentPage: page, totalPages, totalItems: count },
      });
    } else {
      return res.status(400).json({ error: error.message });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateExhibitionProduct = async (req, res) => {
  try {
    const { _id, title, text, imageAltText } = req.body;

    const exhibitionProduct = {
      title,
      text,
      imageAltText,
      slug: slugify(req.body.title),
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
      exhibitionProduct.image = uploadedFile.Location;
    }

    const updatedProduct = await ExhibitionProduct.findOneAndUpdate(
      { _id },
      exhibitionProduct,
      {
        new: true,
      }
    );
    return res.status(201).json({ updatedProduct });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
