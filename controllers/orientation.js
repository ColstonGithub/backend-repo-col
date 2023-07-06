const Orientation = require("../models/orientation");

exports.addOrientationCenter = async (req, res) => {
  try {
    const orientationObj = {
      city: req.body.city,
      centerName: req.body.centerName,
      centerAddress: req.body.centerAddress,
      ocAppointment: req.body.ocAppointment,
      service: req.body.service,
      location: req.body.location,
      purchaseAssistance: req.body.purchaseAssistance,
      email: req.body.email,
      createdBy: req.user._id,
    };

    const orientation = new Orientation(orientationObj);

    orientation.save((error, orientationProd) => {
      if (error) return res.status(400).json({ error });
      if (orientationProd) {
        return res.status(201).json({ orientationProd });
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getOrientationCenterDetailsById = async (req, res) => {
  try {
    const { id } = req.params;
    if (id) {
      await Orientation.findOne({ _id: id }).exec((error, orientationProd) => {
        if (error) return res.status(400).json({ error });
        res.status(200).json({ orientationProd });
      });
    } else {
      return res.status(400).json({ error: "Params required" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// new update
exports.deleteOrientationCenterById = async (req, res) => {
  try {
    const { id } = req.body;
    if (id) {
      const response = await Orientation.findOne({ _id: id });

      if (response) {
        await Orientation.deleteOne({ _id: id }).exec((error, result) => {
          if (error) return res.status(400).json({ error });
          if (result) {
            res
              .status(202)
              .json({ message: "Data has been deleted successful" });
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
      city: prod.city,
      centerName: prod.centerName,
      centerAddress: prod.centerAddress,
      ocAppointment: prod.ocAppointment,
      service: prod.service,
      location: prod.location,
      purchaseAssistance: prod.purchaseAssistance,
      email: prod.email,
      createdAt: prod.createdAt,
    });
  }

  return productList;
}

exports.getOrientationCenters = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10; // Set a default of 10 items per page
  const page = parseInt(req.query.page) || 1; // Set a default page number of 1
  try {
    const orientationProduct = await Orientation.find({})
      .sort({ _id: -1 })
      .limit(limit)
      .skip(limit * page - limit);

    const count = await Orientation.countDocuments().exec();
    const totalPages = Math.ceil(count / limit);
    const orientationProducts = createProducts(orientationProduct);
    if (orientationProducts) {
      res.status(200).json({
        orientationProducts,
        pagination: { currentPage: page, totalPages, totalItems: count },
      });
    } else {
      return res.status(400).json({ error: error.message });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateOrientationCenter = async (req, res) => {
  try {
    const {
      _id,
      city,
      centerName,
      centerAddress,
      ocAppointment,
      service,
      location,
      purchaseAssistance,
      email,
    } = req.body;

    const orientationProduct = {
      city,
      centerName,
      centerAddress,
      ocAppointment,
      service,
      location,
      purchaseAssistance,
      email,
    };

    const updatedProduct = await Orientation.findOneAndUpdate(
      { _id },
      orientationProduct,
      {
        new: true,
      }
    );
    return res.status(201).json({ updatedProduct });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
