const Faq = require("../models/faq");
const FaqCategory = require("../models/faqCategory");
const shortid = require("shortid");
const slugify = require("slugify");

exports.createFaq = (req, res) => {
  try {
    const { faqCategory, question, answer } = req.body;
    const faqData = new Faq({
      faqCategory,
      question,
      answer,
      createdBy: req.user._id,
    });

    faqData.save((error, faq) => {
      if (error) return res.status(400).json({ error });
      if (faq) {
        res.status(200).json({ faqData: faq });
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getFaqById = async (req, res) => {
  try {
    const { id } = req.params;
    if (id) {
      await Faq.findOne({ _id: id }).exec((error, faqData) => {
        if (error) return res.status(400).json({ error });
        if (faqData) {
          res.status(200).json({ faqData });
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
exports.deleteFaqById = async (req, res) => {
  try {
    const { id } = req.body;
    if (id) {
      await Faq.deleteOne({ _id: id }).exec((error, result) => {
        if (error) return res.status(400).json({ error });
        if (result) {
          res
            .status(202)
            .json({ message: "Data has been deleted", result: result });
        }
      });
    } else {
      res.status(400).json({ error: `Params required ${error.message}` });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getFaqs = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10; // Set a default of 10 items per page
  const page = parseInt(req.query.page) || 1; // Set a default page number of 1

  try {
    const faqData = await Faq.find({})
      .sort({ _id: -1 })
      .limit(limit)
      .skip(limit * page - limit);

    const count = await Faq.countDocuments().exec();
    const totalPages = Math.ceil(count / limit);

    if (faqData) {
      res.status(200).json({
        faqData,
        pagination: { currentPage: page, totalPages, totalItems: count },
      });
    } else {
      return res.status(400).json({ error: error.message });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateFaq = async (req, res) => {
  try {
    const {
      _id,
      answer,
      question,
      faqCategory,
    } = req.body;

    const faqData = {
      createdBy: req.user._id,
    };
    if (question != undefined) {
        faqData.question = question;
    }
    if (answer != undefined) {
        faqData.answer = answer;
    }
    if (faqCategory != undefined) {
        faqData.faqCategory = faqCategory;
    }

    const updatedFaq = await Faq.findOneAndUpdate(
      { _id },
      faqData,
      {
        new: true,
      }
    );
    return res.status(201).json({ updatedFaq });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getFaqsByCategoryId = async (req, res) => {
  const { id } = req.body;

  const limit = parseInt(req.query.limit) || 20; // Set a default of 10 items per page
  const page = parseInt(req.query.page) || 1; // Set a default page number of 1

  try {
    const faqs = await Faq.find({ faqCategory: id })
      .sort({ _id: -1 })
      .limit(limit)
      .skip(limit * page - limit)

    const count = await faqs.length;
    const totalPages = Math.ceil(count / limit);
    const individualCat = await FaqCategory.findOne({ _id: id });

    if (!individualCat) {
      return res.status(404).json({ message: "Faq Category not found" });
    }
    if (faqs) {
      res.status(200).json({
        faqs,
        faqCategory: individualCat.name,
        pagination: { currentPage: page, totalPages, totalItems: count },
      });
    } else {
      res.status(200).json({ faqs });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSearchFaq = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10; // Set a default of 10 items per page
  const page = parseInt(req.query.page) || 1; // Set a default page number of 1
  const searchKeyword = req.query.search;
  try {
    const faq = await Faq.find({})
      .sort({ _id: -1 })
//     .limit(limit)
//      .skip(limit * page - limit);
    const count = await Faq.countDocuments().exec();
    const totalPages = Math.ceil(count / limit);

    let filteredProducts = faq;
    if (searchKeyword) {
      filteredProducts = faq.filter((faq) => {
        return faq.question.toLowerCase().includes(searchKeyword.toLowerCase());
      });
      res.status(200).json({
        products: filteredProducts,
//        pagination: { currentPage: page, totalPages, totalItems: count },
      });
    } else {
      return res.status(400).json({ error: "Search Keyword is undefined" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};