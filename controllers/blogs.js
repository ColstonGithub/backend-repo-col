const Blogs = require("../models/blogs");
const BlogCategory = require("../models/blogsCategory");
const slugify = require("slugify");
const shortid = require("shortid");
const AWS = require("aws-sdk");

const s3 = new AWS.S3({
  endpoint: new AWS.Endpoint("https://sgp1.digitaloceanspaces.com"), // Replace with your DigitalOcean Spaces endpoint
  accessKeyId: "DO00DRWTB9KLHRDV4HCB", // Replace with your DigitalOcean Spaces access key ID
  secretAccessKey: "W2Ar0764cy4Y7rsWCecsoZxOZ3mJTJoqxWBo+uppV/c", // Replace with your DigitalOcean Spaces secret access key
});

exports.addBlogs = async (req, res) => {
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

      // Set the image URL in the blogsObj
      blogsObj.image = uploadedFile.Location;
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
    const blogId = req.body.id;
    const blog = await Blogs.findById(blogId);

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    // Delete the associated image data from DigitalOcean Spaces
    if (blog.image) {
      const key = blog.image.split("/").pop();
      const deleteParams = {
        Bucket: "colston-images", // Replace with your DigitalOcean Spaces bucket name
        Key: key,
      };

      await s3.deleteObject(deleteParams).promise();
    }

    await Blogs.findByIdAndDelete(blogId);
    res.status(200).json({ message: "Blog deleted successfully" });
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

      // Set the image URL in the blogsObj
      blogs.image = uploadedFile.Location;
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
