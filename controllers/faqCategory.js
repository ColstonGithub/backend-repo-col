const FaqCategory = require("../models/faqCategory");
const slugify = require("slugify");
const shortid = require("shortid");

function createCategories(categories, parentId = null) {
  const categoryList = [];

  for (let cate of categories) {
    categoryList.push({
      _id: cate._id,
      name: cate.name,
      slug: cate.slug,
      createdAt: cate.createdAt,
    });
  }

  return categoryList;
}

exports.addFaqCategory = (req, res) => {
  try {
    const categoryObj = {
      name: req.body.name,
      slug: slugify(req.body.name),
      createdBy: req.user._id,
    };

    const faqCat = new FaqCategory(categoryObj);

    faqCat.save((error, faqCategory) => {
      if (error) return res.status(400).json({ error });
      if (faqCategory) {
        return res.status(201).json({ faqCategory });
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getFaqCategories = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10; // Set a default of 10 items per page
  const page = parseInt(req.query.page) || 1; // Set a default page number of 1
  try {
    const faqCategories = await FaqCategory.find({})
      .sort({ _id: -1 })
      .limit(limit)
      .skip(limit * page - limit);

    const count = await FaqCategory.countDocuments().exec();
    const totalPages = Math.ceil(count / limit);
    const faqCategoryList = createCategories(faqCategories);

    if (faqCategories) {
      res.status(200).json({
        faqCategoryList,
        pagination: { currentPage: page, totalPages, totalItems: count },
      });
    } else {
      return res.status(400).json({ error: error.message });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateFaqCategory = async (req, res) => {
  try {
    const { _id, name } = req.body;
    const category = {
      name,
      slug: slugify(name),
    };
    const updatedFaqCategory = await FaqCategory.findOneAndUpdate(
      { _id },
      category,
      {
        new: true,
      }
    );
    if (updatedFaqCategory) {
      return res.status(201).json({ updatedFaqCategory });
    } else {
      res.status(400).json({ error: error.message });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteFaqCategory = async (req, res) => {
  try {
    const { id } = req.body;
    if (id) {
      FaqCategory.deleteOne({ _id: id }).exec((error, result) => {
        if (error) return res.status(400).json({ error });
        if (result) {
          res.status(202).json({ message: "Data has been deleted", result });
        }
      });
    } else {
      res.status(400).json({ error: `Params required ${error.message}` });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getFaqCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    if (id) {
      await FaqCategory.findOne({ _id: id }).exec((error, faqCategory) => {
        if (error) return res.status(400).json({ error });
        res.status(200).json({ faqCategory });
      });
    } else {
      return res.status(400).json({ error: "Params required" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
