const Video = require("../models/video");
const shortid = require("shortid");
const slugify = require("slugify");

exports.createVideo = async (req, res) => {
  try {
    const { title, metaData } = req.body;
    let video = "";
    let poster = "";
    if (req.files["video"]) {
      const fileContent = req.files["video"][0].buffer;
      const filename =
        shortid.generate() + "-" + req.files["video"][0].originalname;
      const uploadParams = {
        Bucket: "colston-images", // Replace with your DigitalOcean Spaces bucket name
        Key: filename,
        Body: fileContent,
        ACL: "public-read",
      };

      // Upload the file to DigitalOcean Spaces
      const uploadedFile = await s3.upload(uploadParams).promise();

      // Set the image URL in the bannerImage variable
      video = uploadedFile.Location;
    }
    if (req.files["poster"]) {
      const fileContent = req.files["poster"][0].buffer;
      const filename =
        shortid.generate() + "-" + req.files["poster"][0].originalname;
      const uploadParams = {
        Bucket: "colston-images", // Replace with your DigitalOcean Spaces bucket name
        Key: filename,
        Body: fileContent,
        ACL: "public-read",
      };

      // Upload the file to DigitalOcean Spaces
      const uploadedFile = await s3.upload(uploadParams).promise();

      // Set the image URL in the bannerImage variable
      poster = uploadedFile.Location;
    }

    const videoData = new Video({
      title,
      slug: slugify(title),
      video,
      poster,
      metaData,
      createdBy: req.user._id,
    });

    videoData.save((error, video) => {
      if (error) return res.status(400).json({ error });
      if (video) {
        res.status(200).json({ videoData: video, files: req.files });
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getVideoById = async (req, res) => {
  try {
    const { id } = req.params;
    if (id) {
      await Video.findOne({ _id: id }).exec((error, vid) => {
        if (error) return res.status(400).json({ error });
        if (vid) {
          res.status(200).json({ Video: vid });
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
exports.deleteVideoById = async (req, res) => {
  try {
    const { id } = req.body;
    if (id) {
      const response = await Video.findOne({ _id: id });

      if (response) {
        if (response.video) {
          const key = response.video.split("/").pop();
          const deleteParams = {
            Bucket: "colston-images", // Replace with your DigitalOcean Spaces bucket name
            Key: key,
          };

          await s3.deleteObject(deleteParams).promise();
        }
        if (response.poster) {
          const key = response.poster.split("/").pop();
          const deleteParams = {
            Bucket: "colston-images", // Replace with your DigitalOcean Spaces bucket name
            Key: key,
          };

          await s3.deleteObject(deleteParams).promise();
        }

        await Video.deleteOne({ _id: id }).exec((error, result) => {
          if (error) return res.status(400).json({ error });
          if (result) {
            res
              .status(202)
              .json({ message: "Data has been deleted", result: result });
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

exports.getVideos = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10; // Set a default of 10 items per page
  const page = parseInt(req.query.page) || 1; // Set a default page number of 1

  try {
    const videoData = await Video.find({})
      .sort({ _id: -1 })
      .limit(limit)
      .skip(limit * page - limit);

    const count = await Video.countDocuments().exec();
    const totalPages = Math.ceil(count / limit);

    if (videoData) {
      res.status(200).json({
        videoData,
        pagination: { currentPage: page, totalPages, totalItems: count },
      });
    } else {
      return res.status(400).json({ error: error.message });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateVideo = async (req, res) => {
  try {
    const { _id, title, metaData } = req.body;

    const video = req.files["video"]
      ? process.env.API + "/public/" + req.files["video"][0].filename
      : undefined;

    const poster = req.files["poster"]
      ? process.env.API + "/public/" + req.files["poster"][0].filename
      : undefined;

    const videoData = {
      createdBy: req.user._id,
    };

    if (video != undefined) {
      videoData.video = video;
    }

    if (metaData != undefined) {
      videoData.metaData = metaData;
    }

    if (poster != undefined) {
      videoData.poster = poster;
    }

    if (title != undefined) {
      videoData.title = title;
      videoData.slug = slugify(title);
    }

    const updatedVideoData = await Video.findOneAndUpdate({ _id }, videoData, {
      new: true,
    });
    return res.status(201).json({ updatedVideoData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
