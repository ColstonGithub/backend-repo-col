const Category = require("../models/category");
const slugify = require("slugify");
const shortid = require("shortid");
const path = require("path");
const fs = require("fs");

const AWS = require("aws-sdk");

const s3 = new AWS.S3({
  endpoint: new AWS.Endpoint("https://sgp1.digitaloceanspaces.com"), // Replace with your DigitalOcean Spaces endpoint
  accessKeyId: "DO00DRWTB9KLHRDV4HCB", // Replace with your DigitalOcean Spaces access key ID
  secretAccessKey: "W2Ar0764cy4Y7rsWCecsoZxOZ3mJTJoqxWBo+uppV/c", // Replace with your DigitalOcean Spaces secret access key
});

function createCategories(categories, parentId = null) {
  const categoryList = [];
  let category;
  if (parentId == null) {
    category = categories.filter((cat) => cat.parentId == undefined);
  } else {
    category = categories.filter((cat) => cat.parentId == parentId);
  }

  for (let cate of category) {
    categoryList.push({
      _id: cate._id,
      name: cate.name,
      slug: cate.slug,
      categoryImage: cate.categoryImage,
      parentId: cate.parentId,
      type: cate.type,
      imageAltText: cate.imageAltText,
      keyword: cate.keyword,
      createdAt: cate.createdAt,
      children: createCategories(categories, cate._id),
    });
  }

  return categoryList;
}

exports.addCategory = async (req, res) => {
  try {
    const categoryObj = {
      name: req.body.name,
      slug: slugify(req.body.name),
      type: req.body.type,
      keyword: req.body.keyword,
      imageAltText: req.body.imageAltText,
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

      // Set the image URL in the bannerImage variable
      categoryObj.categoryImage = uploadedFile.Location;
    }

    if (req.body.parentId) {
      categoryObj.parentId = req.body.parentId;
    }

    const cat = new Category(categoryObj);

    cat.save((error, category) => {
      if (error) return res.status(400).json({ error });
      if (category) {
        return res.status(201).json({ category });
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCategories = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10; // Set a default of 10 items per page
  const page = parseInt(req.query.page) || 1; // Set a default page number of 1
  try {
    const categories = await Category.find({}).sort({ _id: -1 });
    // .limit(limit)
    //  .skip(limit * page - limit);
    //   console.log(limit, page);
    const categoryList = createCategories(categories);
    const count = await categoryList.length;
    const totalPages = Math.ceil(count / limit);

    // let subCategory = [];
    // categoryList.map((cat) => {
    //   if (cat.children.length > 0) {
    //     subCategory.push(cat.children);
    //     cat.children.map((child) => {
    //       if (child.children.length > 0) {
    //         subCategory.push(child.children);
    //       }
    //     });
    //   }
    // });

    if (categories) {
      res.status(200).json({
        categoryList,
        // pagination: { currentPage: page, totalPages, totalItems: count },
      });
    } else {
      return res.status(400).json({ error: error.message });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCategories = async (req, res) => {
  try {
    const { _id, name, parentId, keyword, imageAltText } = req.body;
    let categoryImage = "";
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

      // Set the image URL in the bannerImage variable
      categoryImage = uploadedFile.Location;
    }

    const updatedCategories = [];

    if (name instanceof Array) {
      for (let i = 0; i < name.length; i++) {
        const category = {
          name: name[i],
          keyword: keyword[i],
          categoryImage: categoryImage[i],
          imageAltText: imageAltText[i],
          slug: slugify(name[i]),
        };
        if (parentId[i] !== "") {
          category.parentId = parentId[i];
        }

        const updatedCategory = await Category.findOneAndUpdate(
          { _id: _id[i] },
          category,
          { new: true }
        );
        updatedCategories.push(updatedCategory);
      }
      return res.status(201).json({ updateCategories: updatedCategories });
    } else {
      const category = {
        name,
        imageAltText,
        keyword,
        slug: slugify(name),
      };
      if (parentId !== "") {
        category.parentId = parentId;
      }
      if (categoryImage != undefined && categoryImage !== "") {
        category.categoryImage = categoryImage;
      }
      const updatedCategory = await Category.findOneAndUpdate(
        { _id },
        category,
        {
          new: true,
        }
      );
      return res.status(201).json({ updatedCategory });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteCategories = async (req, res) => {
  try {
    const { ids } = req.body.payload;
    const deletedCategories = [];

    const response = await Category.findOne({ _id: ids[0]._id });

    if (response) {
      // Delete the associated image data from DigitalOcean Spaces
      if (response.categoryImage) {
        const key = response.categoryImage.split("/").pop();
        const deleteParams = {
          Bucket: "colston-images", // Replace with your DigitalOcean Spaces bucket name
          Key: key,
        };

        await s3.deleteObject(deleteParams).promise();
      }

      for (let i = 0; i < ids.length; i++) {
        const deleteCategory = await Category.findOneAndDelete({
          _id: ids[i]._id,
          createdBy: req.user._id,
        });
        deletedCategories.push(deleteCategory);
      }
    }
    if (deletedCategories.length == ids.length) {
      res.status(201).json({ message: "Categories removed" });
    } else {
      res.status(400).json({ message: "Something went wrong" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCategoriesById = async (req, res) => {
  try {
    const { id } = req.params;
    if (id) {
      await Category.findOne({ _id: id }).exec((error, category) => {
        if (error) return res.status(400).json({ error });

        res.status(200).json({ category });
      });
    } else {
      return res.status(400).json({ error: "Params required" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSubCategories = async (req, res) => {
  try {
    const category = await Category.find({}).select(
      "_id parentId name imageAltText categoryImage"
    );
    const individualCat = await Category.findOne({ _id: req.params.id });

    if (!individualCat) {
      return res.status(404).json({ message: "Category not found" });
    }
    const subCategory = category
      .filter((cat) => cat.parentId == req.params.id)
      .reverse();
    res.status(200).json({
      subCategoryList: subCategory,
      pageTitle: individualCat.name,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
