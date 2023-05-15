const Career = require("../models/career");
const shortid = require("shortid");
const slugify = require("slugify");

exports.createCareer = (req, res) => {
  try {
    const { name, email, subject, mobileNo, message } = req.body;

    const pdf = req.file
      ? process.env.API + "/public/" + req.file.filename
      : undefined;

    const careerData = new Career({
      name,
      slug: slugify(name),
      email,
      mobileNo,
      subject,
      pdf,
      message,
      // createdBy: req.user._id,
    });
    careerData.save((error, career) => {
      if (error) return res.status(400).json({ error });
      if (career) {
        res.status(200).json({ careerData: career, files: req.file });
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCareerById = async (req, res) => {
  try {
    const { id } = req.params;
    if (id) {
      await Career.findOne({ _id: id }).exec((error, career) => {
        if (error) return res.status(400).json({ error });
        if (career) {
          res.status(200).json({ careerData: career });
        }
      });
    } else {
      return res.status(400).json({ error: "Params required" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// new update
exports.deleteCareerById = async (req, res) => {
  try {
    const { id } = req.body;
    if (id) {
      const response = await CareClean.findOne({ _id: id });

      if (response) {
        let newBannerImage = response?.bannerImage.replace(
          "http://localhost:5000/public/",
          ""
        );

        const imagepath1 = path.join(__dirname, "../uploads", newBannerImage);

        fs.unlink(imagepath1, (error) => {
          if (error) {
            console.error(error);
          }
        });

        await Career.deleteOne({ _id: id }).exec((error, result) => {
          if (error) return res.status(400).json({ error });
          if (result) {
            res.status(202).json({ result });
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

exports.getCareer = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10; // Set a default of 10 items per page
  const page = parseInt(req.query.page) || 1; // Set a default page number of 1

  try {
    const careerData = await Career.find({})
      .sort({ _id: -1 })
      .limit(limit)
      .skip(limit * page - limit);

    const count = await Career.countDocuments().exec();
    const totalPages = Math.ceil(count / limit);

    if (careerData) {
      res.status(200).json({
        careerData: careerData,
        pagination: { currentPage: page, totalPages, totalItems: count },
      });
    } else {
      return res.status(400).json({ error: error.message });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCareer = async (req, res) => {
  try {
    const { _id, name, email, mobileNo, message, subject } = req.body;
    const pdf = req.file
      ? process.env.API + "/public/" + req.file.filename
      : undefined;

    // const careerData = {
    //   createdBy: req.user._id,
    // };
    if (pdf != undefined) {
      careerData.pdf = pdf;
    }
    if (subject != undefined) {
      careerData.subject = subject;
    }
    if (mobileNo != undefined) {
      careerData.mobileNo = mobileNo;
    }

    if (message != undefined) {
      careerData.message = message;
    }

    if (name != undefined) {
      careerData.name = name;
      careerData.slug = slugify(name);
    }
    if (email != undefined) {
      careerData.email = email;
    }

    const updatedCareer = await Career.findOneAndUpdate({ _id }, careerData, {
      new: true,
    });
    return res.status(201).json({ updatedCareer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
