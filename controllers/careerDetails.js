const CareerDetails = require("../models/careerDetails");
const shortid = require("shortid");
const AWS = require("aws-sdk");

const s3 = new AWS.S3({
  endpoint: new AWS.Endpoint("https://sgp1.digitaloceanspaces.com"), // Replace with your DigitalOcean Spaces endpoint
  accessKeyId: "DO00DRWTB9KLHRDV4HCB", // Replace with your DigitalOcean Spaces access key ID
  secretAccessKey: "W2Ar0764cy4Y7rsWCecsoZxOZ3mJTJoqxWBo+uppV/c", // Replace with your DigitalOcean Spaces secret access key
});

exports.addCareerDetails = async (req, res) => {
  try {
    const careerDetailsObj = {
      contentText: req.body.contentText,
      imageAltText: req.body.imageAltText,
      contentHeading: req.body.contentHeading,
      createdBy: req.user._id,
    };
    
    // Upload image files
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

      // Set the image URL in the careerDetailsObj
      careerDetailsObj.image = uploadedFile.Location;
    }

    const careerDetails = new CareerDetails(careerDetailsObj);

    careerDetails.save((error, careerDetail) => {
      if (error) return res.status(400).json({ error: error.message });
      if (careerDetail) {
        return res.status(201).json({ careerDetails: careerDetail });
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCareerDetailsById = async (req, res) => {
  try {
    const { id } = req.params;
    if (id) {
      await CareerDetails.findOne({ _id: id }).exec((error, careerDetail) => {
        if (error) return res.status(400).json({ error: error.message });
        res.status(200).json({ CareerDetails: careerDetail });
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

exports.deleteCareerDetailsById = async (req, res) => {
  try {
    const id = req.body.id;
    const careerDetail = await CareerDetails.findOne({ _id: id });
    if (!careerDetail) {
      return res.status(404).json({ error: "Career Details not found" });
    }

    // Delete the associated image data from DigitalOcean Spaces

    if (careerDetail?.image) {
      const key = careerDetail?.image.split("/").pop();
      const deleteParams = {
        Bucket: "colston-images", // Replace with your DigitalOcean Spaces bucket name
        Key: key,
      };

      await s3.deleteObject(deleteParams).promise();
    }

    try {
      await CareerDetails.deleteOne({ _id: id }); // Delete the document if image deletion is successful
      res.status(200).json({
        message: "Career Details deleted successfully",
      });
    } catch (err) {
      console.error("Error deleting image or document:", err);
      res.status(500).json({ error: "Failed to delete image or document" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

function createCareerDetails(careerDetails) {
  const careerDetailsList = [];
  for (let prod of careerDetails) {
    careerDetailsList.push({
      _id: prod._id,
      contentText: prod.contentText,
      image: prod.image,
      contentHeading: prod.contentHeading,
      imageAltText: prod.imageAltText,
      createdAt: prod.createdAt,
      createdBy: prod.createdBy,
    });
  }

  return careerDetailsList;
}

exports.getCareerDetails = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10; // Set a default of 10 items per page
    const page = parseInt(req.query.page) || 1; // Set a default page number of 1

    const careerDetail = await CareerDetails.find({})
      .sort({ _id: -1 })
      .limit(limit)
      .skip(limit * page - limit);

    const count = await CareerDetails.countDocuments().exec();
    const totalPages = Math.ceil(count / limit);
    const careerDetailsList = createCareerDetails(careerDetail);

    if (careerDetail) {
      res.status(200).json({
        careerDetailsList,
        pagination: { currentPage: page, totalPages, totalItems: count },
      });
    } else {
      return res.status(400).json({ error: error.message });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCareerDetails = async (req, res) => {
  try {
    const { _id, contentText, imageAltText, contentHeading } = req.body;

    const careerDetails = {};

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

      // Set the image URL in the careerDetailsObj
      careerDetails.image = uploadedFile.Location;
    }

    if (contentText != undefined && contentText != "") {
      careerDetails.contentText = contentText;
    }
    if (imageAltText != undefined) {
      careerDetails.imageAltText = imageAltText;
    }

    if (contentHeading != undefined) {
      careerDetails.contentHeading = contentHeading;
    }
    const updatedProduct = await CareerDetails.findOneAndUpdate(
      { _id },
      careerDetails,
      {
        new: true,
      }
    );
    return res.status(201).json({ updatedProduct });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
