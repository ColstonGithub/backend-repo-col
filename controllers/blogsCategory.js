const BlogCategory = require("../models/blogsCategory");
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

exports.addBlogCategory = (req, res) => {
  try {
    const categoryObj = {
      name: req.body.name,
      slug: slugify(req.body.name),
      createdBy: req.user._id,
    };
    const blogCat = new BlogCategory(categoryObj);
    blogCat.save((error, blogCategory) => {
      if (error) return res.status(400).json({ error });
      if (blogCategory) {
        return res.status(201).json({ blogCategory });
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getBlogCategories = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10; // Set a default of 10 items per page
  const page = parseInt(req.query.page) || 1; // Set a default page number of 1
  try {
    const blogCategories = await BlogCategory.find({})
      .sort({ _id: -1 })
      .limit(limit)
      .skip(limit * page - limit);

    const count = await BlogCategory.countDocuments().exec();
    const totalPages = Math.ceil(count / limit);
    const blogCategoryList = createCategories(blogCategories);

    if (blogCategories) {
      res.status(200).json({
        blogCategoryList,
        pagination: { currentPage: page, totalPages, totalItems: count },
      });
    } else {
      return res.status(400).json({ error: error.message });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateBlogCategory = async (req, res) => {
  try {
    const { _id, name } = req.body;
    const category = {
      name,
      slug: slugify(name),
    };
    const updatedBlogCategory = await BlogCategory.findOneAndUpdate(
      { _id },
      category,
      {
        new: true,
      }
    );
    if (updatedBlogCategory) {
      return res.status(201).json({ updatedBlogCategory });
    } else {
      res.status(400).json({ error: error.message });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteBlogCategory = async (req, res) => {
  try {
    const { id } = req.body;
    if (id) {
    BlogCategory.deleteOne({ _id: id }).exec((error, result) => {
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

exports.getBlogCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    if (id) {
      await BlogCategory.findOne({ _id: id }).exec((error, blogCategory) => {
        if (error) return res.status(400).json({ error });
        res.status(200).json({ blogCategory });
      });
    } else {
      return res.status(400).json({ error: "Params required" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
