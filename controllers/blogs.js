const Blogs = require("../models/blogs");
const BlogCategory = require("../models/blogsCategory");
const slugify = require("slugify");
const path = require("path");
const fs = require("fs");
// let sortBy = require("lodash.sortby");

exports.addBlogs = (req, res) => {
  try {
    const blogsObj = {
      title: req.body.title,
      slug: slugify(req.body.title),
      text: req.body.text,
      blogCategory: req.body.blogCategory,
      imageAltText: req.body.imageAltText,
      pageTitle: req.body.pageTitle,
      pageHeading: req.body.pageHeading,
      createdBy: req.user._id,
    };

    if (req.file) {
      blogsObj.image = process.env.API + "/public/" + req.file.filename;
    }

    const blogs = new Blogs(blogsObj);

    blogs.save((error, blog) => {
      if (error) return res.status(400).json({ error: error.message });
      if (blog) {
        return res.status(201).json({ blogs: blog });
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getBlogsDetailsById = async (req, res) => {
  try {
    const { id } = req.params;
    if (id) {
      await Blogs.findOne({ _id: id }).exec((error, blog) => {
        if (error) return res.status(400).json({ error: error.message });
        res.status(200).json({ Blogs: blog });
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

exports.deleteBlogsById = async (req, res) => {
  try {
    const { id } = req.body;
    if (id) {
      const response = await Blogs.findOne({ _id: id });

      if (response) {
        let newBannerImage = response?.image.replace(
          "http://64.227.150.49:5000/public/",
          ""
        );

        const imagepath1 = path.join(__dirname, "../uploads", newBannerImage);

        fs.unlink(imagepath1, (error) => {
          if (error) {
            console.error(error);
          }
        });

        await Blogs.deleteOne({ _id: id }).exec((error, result) => {
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

function createBlogs(blog) {
  const BlogsList = [];
  for (let prod of blog) {
    BlogsList.push({
      _id: prod._id,
      title: prod.title,
      blogCategory: prod.blogCategory,
      text: prod.text,
      imageAltText: prod.imageAltText,
      image: prod.image,
      pageTitle: prod.pageTitle,
      pageHeading: prod.pageHeading,
      createdAt: prod.createdAt,
      createdBy: prod.createdBy,
    });
  }

  return BlogsList;
}

exports.getBlogs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10; // Set a default of 10 items per page
    const page = parseInt(req.query.page) || 1; // Set a default page number of 1

    const blog = await Blogs.find({})
      .sort({ _id: -1 })
      .limit(limit)
      .skip(limit * page - limit);

    const count = await Blogs.countDocuments().exec();
    const totalPages = Math.ceil(count / limit);
    const blogsList = createBlogs(blog);

    if (blog) {
      res.status(200).json({
        blogsList,
        pagination: { currentPage: page, totalPages, totalItems: count },
      });
    } else {
      return res.status(400).json({ error: error.message });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateBlogs = async (req, res) => {
  try {
    const {
      _id,
      title,
      text,
      blogCategory,
      imageAltText,
      pageHeading,
      pageTitle,
    } = req.body;

    const blogs = {};
    if (req.file) {
      blogs.image = process.env.API + "/public/" + req.file.filename;
    }
    if (title != undefined) {
      blogs.title = title;
      blogs.slug = slugify(req.body.title);
    }
    if (blogCategory != undefined) {
      blogs.blogCategory = blogCategory;
    }
    if (text != undefined) {
      blogs.text = text;
    }
    if (imageAltText != undefined) {
      blogs.imageAltText = imageAltText;
    }
    if (pageTitle != undefined) {
      blogs.pageTitle = pageTitle;
    }
    if (pageHeading != undefined) {
      blogs.pageHeading = pageHeading;
    }
    const updatedProduct = await Blogs.findOneAndUpdate({ _id }, blogs, {
      new: true,
    });
    return res.status(201).json({ updatedProduct });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getBlogsByCategoryId = async (req, res) => {
  const { id } = req.body;

  const limit = parseInt(req.query.limit) || 20; // Set a default of 10 items per page
  const page = parseInt(req.query.page) || 1; // Set a default page number of 1

  try {
    const blogs = await Blogs.find({ blogCategory: id }).sort({ _id: -1 });

    const count = await blogs.length;
    const totalPages = Math.ceil(count / limit);
    const individualCat = await BlogCategory.findOne({ _id: id });

    if (!individualCat) {
      return res.status(404).json({ message: "Blog Category not found" });
    }
    if (blogs) {
      res.status(200).json({
        blogs,
        blogCategory: individualCat.name,
        // pagination: { currentPage: page, totalPages, totalItems: count },
      });
    } else {
      res.status(200).json({ blogs });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
