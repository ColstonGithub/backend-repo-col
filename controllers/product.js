const Product = require("../models/product");
const shortid = require("shortid");
const slugify = require("slugify");
let sortBy = require("lodash.sortby");
const Category = require("../models/category");

exports.createProduct = (req, res) => {
  try {
    const { name, description, specification, category } = req.body;

    let productPictures = [];

    const pdf = req.files["pdf"] ? req.files["pdf"][0].location : undefined;

    let colors =
      req.files[`colorPicture1`] && req.files[`colorPicture1`] !== undefined
        ? req.body.colorName
        : [];
    let col =
      req.files[`colorPicture0`] && req.files[`colorPicture0`] !== undefined
        ? req.body.colorName
        : [];
    let colorDocs;
    // Store data in array before saving

    if (req.files[`colorPicture1`] !== undefined && colors !== []) {
      console.log("nds", colors, col);
      colorDocs = colors?.map((color, index) => {
        const productPictures = req.files[`colorPicture${index}`].map(
          (picture, i) => {
            return {
              img: picture.location,
              colorImageAltText: req.body.colorImageAltText[i] || "",
            };
          }
        );

        return {
          colorName: color,
          productPictures,
        };
      });
    } else if (col && req.files[`colorPicture0`]?.length > 1) {
      console.log("nhg", colors, col);
      colorDocs = {
        colorName: req.body.colorName ? req.body.colorName : "",
        productPictures: req.files[`colorPicture0`].map((picture, i) => {
          return {
            img: picture.location,
            colorImageAltText: req.body.colorImageAltText[i] || "",
          };
        }),
      };
    } else if (col && req.files[`colorPicture0`]) {
      console.log("gfdfgg",req.files[`colorPicture0`][0]?.location);
      colorDocs = [
        {
          colorName: req.body.colorName ? req.body.colorName : "",
          productPictures: [
            {
              img: req.files[`colorPicture0`][0]?.location,
              colorImageAltText: req.body.colorImageAltText || "",
            },
          ],
        },
      ];
    }

    if (req.files) {
      productPictures =
        req.files["productPicture"] &&
        req.files["productPicture"]?.map((file, index) => {
          return {
            img: file.location,
            imageAltText: req.body.imageAltText[index] || "",
          };
        });
    }

    const product = new Product({
      name: name,
      slug: slugify(name),
      description,
      productPictures,
      pdf,
      category,
      specification,
      colors: colorDocs,
      createdBy: req.user._id,
    });

    product.save((error, product) => {
      if (error) return res.status(400).json({ error: error.message });
      if (product) {
        res.status(201).json({ product, files: req.files });
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProductDetailsById = (req, res) => {
  try {
    const { productId } = req.params;
    if (productId) {
      Product.findOne({ _id: productId }).exec((error, product) => {
        if (error) return res.status(400).json({ error });

        if (product) {
          Product.find({ category: product.category }).exec(
            (error, relatedProducts) => {
              if (error) {
                return res.status(400).json({ error });
              } else {
                res
                  .status(200)
                  .json({ product, relatedProducts: relatedProducts });
              }
            }
          );
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
exports.deleteProductById = (req, res) => {
  try {
    const { productId } = req.body;
    if (productId) {
      Product.deleteOne({ _id: productId }).exec((error, result) => {
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

function createProducts(products) {
  const productList = [];
  for (let prod of products) {
    productList.push({
      _id: prod._id,
      name: prod.name,
      colors: prod.colors,
      description: prod.description,
      specification: prod.specification,
      pdf: prod.pdf,
      amazonLink: prod.amazonLink,
      productPictures: prod.productPictures,
      category: prod.category,
      createdAt: prod.createdAt,
      createdBy: prod.createdBy,
    });
  }

  return productList;
}

exports.getProducts = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10; // Set a default of 10 items per page
  const page = parseInt(req.query.page) || 1; // Set a default page number of 1

  try {
    const product = await Product.find({})
      .sort({ _id: -1 })
      .limit(limit)
      .skip(limit * page - limit);
    const count = await Product.countDocuments().exec();
    const totalPages = Math.ceil(count / limit);

    const products = createProducts(product);

    let sortedByDates = sortBy(products, "updatedAt");
    if (product) {
      res.status(200).json({
        products,
        pagination: { currentPage: page, totalPages, totalItems: count },
      });
    } else {
      return res.status(400).json({ error: error.message });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { name, _id, description, specification, category, createdBy } =
      req.body;

    let productPictures = [];

    const pdf = req.files["pdf"] ? req.files["pdf"][0].location : undefined;

    if (req.files) {
      productPictures =
        req.files["productPicture"] &&
        req.files["productPicture"]?.map((file, index) => {
          return {
            img: file.location,
            imageAltText: req.body.imageAltText[index] || "",
          };
        });
    }

    let colors =
      req.files[`colorPicture1`] && req.files[`colorPicture1`] !== undefined
        ? req.body.colorName
        : [];
    let col =
      req.files[`colorPicture0`] && req.files[`colorPicture0`] !== undefined
        ? req.body.colorName
        : [];
    let colorDocs;

    // Store data in array before saving

    if (req.files[`colorPicture1`] !== undefined && colors !== []) {
      colorDocs = colors?.map((color, index) => {
        const productPictures = req.files[`colorPicture${index}`].map(
          (picture, i) => {
            return {
              img: picture.location,
              colorImageAltText: req.body.colorImageAltText[i] || "",
            };
          }
        );

        return {
          colorName: color,
          productPictures,
        };
      });
    } else if (col && req.files[`colorPicture0`]?.length > 1) {
      colorDocs = {
        colorName: req.body.colorName ? req.body.colorName : "",
        productPictures: req.files[`colorPicture0`].map((picture, i) => {
          return {
            img: picture.location,
            colorImageAltText: req.body.colorImageAltText[i] || "",
          };
        }),
      };
    } else if (col && req.files[`colorPicture0`]) {
      colorDocs = [
        {
          colorName: req.body.colorName ? req.body.colorName : "",
          productPictures: [
            {
              img: req.files[`colorPicture0`][0]?.location,
              colorImageAltText: req.body.colorImageAltText || "",
            },
          ],
        },
      ];
    }

    const product = {
      createdBy: req.user._id,
    };

    if (name && name != undefined) {
      product.name = name;
      product.slug = slugify(name);
    }
    if (description && description != undefined) {
      product.description = description;
    }
    if (category && category != undefined) {
      product.category = category;
    }
    if (specification && specification != undefined) {
      product.specification = specification;
    }

    if (
      (req.files[`colorPicture1`] !== undefined && colors !== []) ||
      (col && req.files[`colorPicture0`])
    ) {
      product.colors = colorDocs;
    }

    if (productPictures !== undefined && productPictures !== []) {
      product.productPictures = productPictures;
    }
    if (pdf != undefined) {
      product.pdf = pdf;
    }

    const updatedProduct = await Product.findOneAndUpdate({ _id }, product, {
      new: true,
    });
    return res.status(201).json({ updatedProduct });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProductsByCategoryId = async (req, res) => {
  const { id } = req.body;

  const limit = parseInt(req.query.limit) || 20; // Set a default of 10 items per page
  const page = parseInt(req.query.page) || 1; // Set a default page number of 1

  try {
    const products = await Product.find({ category: id })
      .sort({ _id: -1 })
      .limit(limit)
      .skip(limit * page - limit)
      .select("_id name productPictures category");

    const count = await products.length;
    const totalPages = Math.ceil(count / limit);
    const individualCat = await Category.findOne({ _id: id });

    if (!individualCat) {
      return res.status(404).json({ message: "Category not found" });
    }
    if (products) {
      res.status(200).json({
        products,
        pageTitle: individualCat.name,
        pagination: { currentPage: page, totalPages, totalItems: count },
      });
    } else {
      res.status(200).json({ products });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getNewArrivalProducts = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10; // Set a default of 10 items per page
  const page = parseInt(req.query.page) || 1; // Set a default page number of 1

  try {
    const product = await Product.find({})
      .select("_id productPictures category name")
      .sort({ _id: -1 })
      .limit(limit)
      .skip(limit * page - limit);
    const count = await Product.countDocuments().exec();
    const totalPages = Math.ceil(count / limit);

    const products = createProducts(product);

    let sortedByDates = sortBy(products, "updatedAt");

    if (product) {
      res.status(200).json({
        newArrivals: sortedByDates,
        pagination: { currentPage: page, totalPages, totalItems: count },
      });
    } else {
      return res.status(400).json({ error: error.message });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSearchProducts = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10; // Set a default of 10 items per page
  const page = parseInt(req.query.page) || 1; // Set a default page number of 1
  const searchKeyword = req.query.search;

  try {
    const product = await Product.find({})
      .select("_id productPictures category name")
      .sort({ _id: -1 })
      .limit(limit)
      .skip(limit * page - limit);
    const count = await Product.countDocuments().exec();
    const totalPages = Math.ceil(count / limit);

    let filteredProducts = product;
    if (searchKeyword) {
      filteredProducts = product.filter((product) => {
        return product.name.toLowerCase().includes(searchKeyword.toLowerCase());
      });
      res.status(200).json({
        products: filteredProducts,
        pagination: { currentPage: page, totalPages, totalItems: count },
      });
    } else {
      return res.status(400).json({ error: error.message });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// exports.getProductsCode = async (req, res) => {
//   try {
//     const product = await Product.find({}).select("_id name").sort({ _id: -1 });

//     if (product) {
//       res.status(200).json({
//         product,
//       });
//     } else {
//       return res.status(400).json({ error: error.message });
//     }
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };
