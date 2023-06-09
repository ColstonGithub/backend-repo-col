const NewsPress = require("../models/newsPress");
const slugify = require("slugify");
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

exports.addNewsPress = async (req, res) => {
  try {
    const newsPressObj = {
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
      newsPressObj.image = uploadedFile.Location;
    }

    const newspress = new NewsPress(newsPressObj);

    newspress.save((error, newsP) => {
      if (error) return res.status(400).json({ error: error.message });
      if (newsP) {
        return res.status(201).json({ newsPress: newsP });
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getNewsPressDetailsById = (req, res) => {
  try {
    const { id } = req.params;
    if (id) {
      NewsPress.findOne({ _id: id }).exec((error, newsP) => {
        if (error) return res.status(400).json({ error: error.message });
        res.status(200).json({ newsPress: newsP });
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

exports.deleteNewsPressById = async (req, res) => {
  try {
    const { id } = req.body;
    if (id) {
      const response = await NewsPress.findOne({ _id: id });

      if (response) {
        if (response.image) {
          const key = response.image.split("/").pop();
          const deleteParams = {
            Bucket: "colston-images", // Replace with your DigitalOcean Spaces bucket name
            Key: key,
          };

          await s3.deleteObject(deleteParams).promise();
        }

        NewsPress.deleteOne({ _id: id }).exec((error, result) => {
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

function createNewsPress(newsPress) {
  const NewsPressList = [];
  for (let prod of newsPress) {
    NewsPressList.push({
      _id: prod._id,
      title: prod.title,
      text: prod.text,
      imageAltText: prod.imageAltText,
      image: prod.image,
      createdAt: prod.createdAt,
      createdBy: prod.createdBy,
    });
  }

  return NewsPressList;
}

exports.getNewsPress = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10; // Set a default of 10 items per page
    const page = parseInt(req.query.page) || 1; // Set a default page number of 1

    const newsP = await NewsPress.find({})
      .sort({ _id: -1 })
      .limit(limit)
      .skip(limit * page - limit);

    const count = await NewsPress.countDocuments().exec();
    const totalPages = Math.ceil(count / limit);
    const newsPressList = createNewsPress(newsP);

    if (newsP) {
      res.status(200).json({
        newsPressList,
        pagination: { currentPage: page, totalPages, totalItems: count },
      });
    } else {
      return res.status(400).json({ error: error.message });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateNewsPress = async (req, res) => {
  try {
    const { _id, title, text, imageAltText } = req.body;

    const newsPress = {};
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
      newsPress.image = uploadedFile.Location;
    }

    if (title) {
      newsPress.title = title;
      newsPress.slug = slugify(req.body.title);
    }
    if (text) {
      newsPress.text = text;
    }
    if (imageAltText) {
      newsPress.imageAltText = imageAltText;
    }

    const updatedProduct = await NewsPress.findOneAndUpdate(
      { _id },
      newsPress,
      {
        new: true,
      }
    );
    return res.status(201).json({ updatedProduct });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
