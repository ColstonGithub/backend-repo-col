const AboutUs = require("../models/aboutUs");
const shortid = require("shortid");
const slugify = require("slugify");

const AWS = require("aws-sdk");

const s3 = new AWS.S3({
  endpoint: new AWS.Endpoint("https://sgp1.digitaloceanspaces.com"), // Replace with your DigitalOcean Spaces endpoint
  accessKeyId: "DO00DRWTB9KLHRDV4HCB", // Replace with your DigitalOcean Spaces access key ID
  secretAccessKey: "W2Ar0764cy4Y7rsWCecsoZxOZ3mJTJoqxWBo+uppV/c", // Replace with your DigitalOcean Spaces secret access key
});

exports.createAboutUs = async (req, res) => {
  try {
    const { text, heading, bannerImageAltText, title } = req.body;

    let bannerImage = "";
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
      bannerImage = uploadedFile.Location;
    }
    const aboutUsData = new AboutUs({
      title,
      slug: slugify(title),
      heading,
      bannerImage,
      bannerImageAltText,
      text,
      createdBy: req.user._id,
    });

    aboutUsData.save((error, aboutUs) => {
      if (error) return res.status(400).json({ error });
      if (aboutUs) {
        res.status(200).json({ aboutUsData: aboutUs, files: req.files });
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAboutUsById = async (req, res) => {
  try {
    const { id } = req.params;
    if (id) {
      await AboutUs.findOne({ _id: id }).exec((error, about) => {
        if (error) return res.status(400).json({ error });
        if (about) {
          res.status(200).json({ AboutUs: about });
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
exports.deleteAboutUsById = async (req, res) => {
  try {
    const { id } = req.body;
    if (id) {
      const response = await AboutUs.findOne({ _id: id });

      if (response) {
        // Delete the associated image data from DigitalOcean Spaces
        if (response.bannerImage) {
          const key = response.bannerImage.split("/").pop();
          const deleteParams = {
            Bucket: "colston-images", // Replace with your DigitalOcean Spaces bucket name
            Key: key,
          };
    
          await s3.deleteObject(deleteParams).promise();
        }

        await AboutUs.deleteOne({ _id: id }, (error, result) => {
          if (error) return res.status(400).json({ error });
          if (result) {
            res
              .status(202)
              .json({ message: "Data has been deleted", result: result });
          }
        });
      }
    } else {
      res.status(400).json({ error: `id not found` });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAboutUs = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10; // Set a default of 10 items per page
  const page = parseInt(req.query.page) || 1; // Set a default page number of 1
  try {
    const aboutUsData = await AboutUs.find({})
      .sort({ _id: -1 })
      .limit(limit)
      .skip(limit * page - limit);

    const count = await AboutUs.countDocuments().exec();
    const totalPages = Math.ceil(count / limit);

    if (aboutUsData) {
      res.status(200).json({
        aboutUsData,
        pagination: { currentPage: page, totalPages, totalItems: count },
      });
    } else {
      return res.status(400).json({ error: error.message });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateAboutUs = async (req, res) => {
  try {
    const { _id, text, heading, bannerImageAltText, title } = req.body;

    const aboutUsData = {
      createdBy: req.user._id,
    };
    if (req.files["bannerImage"]) {
      const fileContent = req.files["bannerImage"][0].buffer;
      const filename =
        shortid.generate() + "-" + req.files["bannerImage"][0].originalname;
      const uploadParams = {
        Bucket: "colston-images", // Replace with your DigitalOcean Spaces bucket name
        Key: filename,
        Body: fileContent,
        ACL: "public-read",
      };

      // Upload the file to DigitalOcean Spaces
      const uploadedFile = await s3.upload(uploadParams).promise();

      // Set the image URL in the bannerImage variable
      aboutUsData.bannerImage = uploadedFile.Location;
    }

    if (text != undefined && text != "") {
      aboutUsData.text = text;
    }

    if (heading != undefined && heading != "") {
      aboutUsData.heading = heading;
    }

    if (bannerImageAltText != undefined && bannerImageAltText != "") {
      aboutUsData.bannerImageAltText = bannerImageAltText;
    }

    if (title != undefined && title != "") {
      aboutUsData.title = title;
      aboutUsData.slug = slugify(title);
    }

    const updatedAboutUsData = await AboutUs.findOneAndUpdate(
      { _id },
      aboutUsData,
      {
        new: true,
      }
    );
    return res.status(201).json({ updatedAboutUsData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
