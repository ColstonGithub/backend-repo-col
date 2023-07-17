const WhereToBuy = require("../models/whereToBuy");

exports.addWhereToBuy = async (req, res) => {
  try {
    const whereToBuyObj = {
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

    const whereToBuy = new WhereToBuy(whereToBuyObj);

    whereToBuy.save((error, whereToBuyProd) => {
      if (error) return res.status(400).json({ error });
      if (whereToBuyProd) {
        return res.status(201).json({ whereToBuyProd });
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getWhereToBuyDetailsById = async (req, res) => {
  try {
    const { id } = req.params;
    if (id) {
      await WhereToBuy.findOne({ _id: id }).exec((error, whereToBuyProd) => {
        if (error) return res.status(400).json({ error });
        res.status(200).json({ whereToBuyProd });
      });
    } else {
      return res.status(400).json({ error: "Params required" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// new update
exports.deleteWhereToBuyById = async (req, res) => {
  try {
    const { id } = req.body;
    if (id) {
      const response = await WhereToBuy.findOne({ _id: id });

      if (response) {
        await WhereToBuy.deleteOne({ _id: id }).exec((error, result) => {
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

exports.getWhereToBuyCenters = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10; // Set a default of 10 items per page
  const page = parseInt(req.query.page) || 1; // Set a default page number of 1
  try {
    const whereToBuyProduct = await WhereToBuy.find({})
      .sort({ _id: -1 })
      .limit(limit)
      .skip(limit * page - limit);

    const count = await WhereToBuy.countDocuments().exec();
    const totalPages = Math.ceil(count / limit);
    const whereToBuyProducts = createProducts(whereToBuyProduct);
    if (whereToBuyProducts) {
      res.status(200).json({
        whereToBuyProducts,
        pagination: { currentPage: page, totalPages, totalItems: count },
      });
    } else {
      return res.status(400).json({ error: error.message });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateWhereToBuy = async (req, res) => {
  try {
    const { id, data } = req.body;
    const _id = id;
    const whereToBuyObject = {
      city: data?.city,
      centerName: data?.centerName,
      centerAddress: data?.centerAddress,
      location: data?.location,
      email: data?.email,
      ocAppointment: data?.ocAppointment,
      service: data?.service,
      purchaseAssistance: data?.purchaseAssistance,
    };

    const updatedProduct = await WhereToBuy.findOneAndUpdate(
      { _id },
      whereToBuyObject,
      {
        new: true,
      }
    );

    return res.status(201).json({ updatedProduct });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getFilterWhereToBuyByCity = async (req, res) => {
  const { selectedCity } = req.body;

  try {
    if (!selectedCity) {
      return res.status(400).json({ error: "City parameter is required" });
    }

    const regex = new RegExp(selectedCity, "i");
    const query = { city: regex };

    const whereToBuyProducts = await WhereToBuy.find(query);

    if (whereToBuyProducts.length === 0) {
      return res
        .status(404)
        .json({ error: "No data found for the selected city" });
    }

    const filteredProducts = whereToBuyProducts.map((product) => {
      return {
        city: product.city,
        centerName: product.centerName,
        centerAddress: product.centerAddress,
        ocAppointment: product.ocAppointment,
        service: product.service,
        location: product.location,
        purchaseAssistance: product.purchaseAssistance,
        email: product.email,
        createdBy: product.createdBy,
      };
    });

    res.status(200).json({ whereToBuyFiltered: filteredProducts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
