const RequestForQuotation = require("../models/requestForQuotation");
const shortid = require("shortid");
const slugify = require("slugify");

exports.addRequestForQuotation = (req, res) => {
  try {
    const {
      name,
      email,
      mobileNo,
      subject,
      landmark,
      address,
      pincode,
      state,
      city,
      purchaseDate,
      productCategory,
      productCodeName,
      problem,
      callType,
      dealerName,
    } = req.body;
    const requestForQuotationData = new RequestForQuotation({
      name,
      slug: slugify(name),
      email,
      mobileNo,
      subject,
      landmark,
      address,
      pincode,
      state,
      city,
      purchaseDate,
      productCategory,
      productCodeName,
      problem,
      callType,
      dealerName,
      // createdBy: req.user._id,
    });
    requestForQuotationData.save((error, request) => {
      if (error) return res.status(400).json({ error });
      if (request) {
        res
          .status(200)
          .json({ requestForQuotationData: request, files: req.file });
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRequestForQuotationById = async (req, res) => {
  try {
    const { id } = req.params;
    if (id) {
      await RequestForQuotation.findOne({ _id: id }).exec((error, request) => {
        if (error) return res.status(400).json({ error });
        if (request) {
          res.status(200).json({ requestData: request });
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
exports.deleteRequestForQuotationById = async (req, res) => {
  try {
    const { id } = req.body;
    if (id) {
      await RequestForQuotation.deleteOne({ _id: id }).exec((error, result) => {
        if (error) return res.status(400).json({ error });
        if (result) {
          res.status(202).json({ result });
        }
      });
    } else {
      res.status(400).json({ error: "Params required" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRequestForQuotation = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10; // Set a default of 10 items per page
  const page = parseInt(req.query.page) || 1; // Set a default page number of 1

  try {
    const requestForQuotationData = await RequestForQuotation.find({})
      .sort({ _id: -1 })
      .limit(limit)
      .skip(limit * page - limit);

    const count = await RequestForQuotation.countDocuments().exec();
    const totalPages = Math.ceil(count / limit);

    if (requestForQuotationData) {
      res.status(200).json({
        requestForQuotationData,
        pagination: { currentPage: page, totalPages, totalItems: count },
      });
    } else {
      return res.status(400).json({ error: error.message });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateRequestForQuotation = async (req, res) => {
  try {
    const {
      _id,
      name,
      email,
      mobileNo,
      subject,
      landmark,
      address,
      pincode,
      state,
      city,
      purchaseDate,
      productCategory,
      productCodeName,
      problem,
      callType,
      dealerName,
    } = req.body;

    // const requestForQuotationData = {
    //   // createdBy: req.user._id,
    // };

    if (subject != undefined) {
      requestForQuotationData.subject = subject;
    }
    if (mobileNo != undefined) {
      requestForQuotationData.mobileNo = mobileNo;
    }

    if (landmark != undefined) {
      requestForQuotationData.landmark = landmark;
    }

    if (name != undefined) {
      requestForQuotationData.name = name;
      requestForQuotationData.slug = slugify(name);
    }
    if (email != undefined) {
      requestForQuotationData.email = email;
    }
    if (address != undefined) {
      requestForQuotationData.address = address;
    }
    if (pincode != undefined) {
      requestForQuotationData.pincode = pincode;
    }
    if (state != undefined) {
      requestForQuotationData.state = state;
    }
    if (city != undefined) {
      requestForQuotationData.city = city;
    }
    if (purchaseDate != undefined) {
      requestForQuotationData.email = email;
    }

    if (productCategory != undefined) {
      requestForQuotationData.productCategory = productCategory;
    }
    if (productCodeName != undefined) {
      requestForQuotationData.productCodeName = productCodeName;
    }
    if (dealerName != undefined) {
      requestForQuotationData.dealerName = dealerName;
    }
    if (callType != undefined) {
      requestForQuotationData.callType = callType;
    }
    if (problem != undefined) {
      requestForQuotationData.problem = problem;
    }
    const updatedrequestForQuotation =
      await RequestForQuotation.findOneAndUpdate(
        { _id },
        requestForQuotationData,
        {
          new: true,
        }
      );
    return res.status(201).json({ updatedrequestForQuotation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
