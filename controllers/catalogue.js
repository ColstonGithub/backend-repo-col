const Catalogue = require("../models/catalogue");
const slugify = require("slugify");
const shortid = require("shortid");
const AWS = require("aws-sdk");

const s3 = new AWS.S3({
  endpoint: new AWS.Endpoint("https://sgp1.digitaloceanspaces.com"), // Replace with your DigitalOcean Spaces endpoint
  accessKeyId: "DO00DRWTB9KLHRDV4HCB", // Replace with your DigitalOcean Spaces access key ID
  secretAccessKey: "W2Ar0764cy4Y7rsWCecsoZxOZ3mJTJoqxWBo+uppV/c", // Replace with your DigitalOcean Spaces secret access key
});

exports.addCatalogue = async (req, res) => {
  try {
    const catalogueObj = {
      title: req.body.title,
      slug: slugify(req.body.title),
      imageAltText: req.body.imageAltText,
      createdBy: req.user._id,
    };

    // Upload PDF file
    if (req.files && req.files["pdf"]) {
      const pdfFile = req.files["pdf"][0];
      const pdfContent = pdfFile.buffer;
      const pdfFilename = shortid.generate() + "-" + pdfFile.originalname;
      const pdfUploadParams = {
        Bucket: "colston-images", // Replace with your DigitalOcean Spaces bucket name
        Key: pdfFilename,
        Body: pdfContent,
        ACL: "public-read",
      };

      // Upload the PDF file to DigitalOcean Spaces
      const uploadedPDF = await s3.upload(pdfUploadParams).promise();

      // Set the PDF URL in the catalogueObj
      catalogueObj.pdf = uploadedPDF.Location;
    }

    // Upload image files
    if (req.files && req.files["image"]) {
      const imageFile = req.files["image"][0];
      const imageContent = imageFile.buffer;
      const imageFilename = shortid.generate() + "-" + imageFile.originalname;
      const imageUploadParams = {
        Bucket: "colston-images", // Replace with your DigitalOcean Spaces bucket name
        Key: imageFilename,
        Body: imageContent,
        ACL: "public-read",
      };

      // Upload the PDF file to DigitalOcean Spaces
      const uploadedImage = await s3.upload(imageUploadParams).promise();

      // Set the PDF URL in the catalogueObj
      catalogueObj.image = uploadedImage.Location;
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
        let pdf = response?.pdf.replace("http://localhost:5000/public/", "");
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

    // Upload PDF file
    if (req.files && req.files["pdf"]) {
      const pdfFile = req.files["pdf"][0];
      const pdfContent = pdfFile.buffer;
      const pdfFilename = shortid.generate() + "-" + pdfFile.originalname;
      const pdfUploadParams = {
        Bucket: "colston-images", // Replace with your DigitalOcean Spaces bucket name
        Key: pdfFilename,
        Body: pdfContent,
        ACL: "public-read",
      };

      // Upload the PDF file to DigitalOcean Spaces
      const uploadedPDF = await s3.upload(pdfUploadParams).promise();

      // Set the PDF URL in the catalogueObj
      catalogue.pdf = uploadedPDF.Location;
    }

    // Upload image files
    if (req.files && req.files["image"]) {
      const imageFile = req.files["image"][0];
      const imageContent = imageFile.buffer;
      const imageFilename = shortid.generate() + "-" + imageFile.originalname;
      const imageUploadParams = {
        Bucket: "colston-images", // Replace with your DigitalOcean Spaces bucket name
        Key: imageFilename,
        Body: imageContent,
        ACL: "public-read",
      };

      // Upload the PDF file to DigitalOcean Spaces
      const uploadedImage = await s3.upload(imageUploadParams).promise();

      // Set the PDF URL in the catalogueObj
      catalogue.image = uploadedImage.Location;
    }

    if (title != undefined && title != "") {
      catalogue.title = title;
      catalogue.slug = slugify(req.body.title);
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
