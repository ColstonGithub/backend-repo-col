const Product = require("../models/product");
const shortid = require("shortid");
const slugify = require("slugify");
let sortBy = require("lodash.sortby");
const Category = require("../models/category");
const path = require("path");
const fs = require("fs");
const AWS = require("aws-sdk");

const s3 = new AWS.S3({
  endpoint: new AWS.Endpoint("https://sgp1.digitaloceanspaces.com"), // Replace with your DigitalOcean Spaces endpoint
  accessKeyId: "DO00DRWTB9KLHRDV4HCB", // Replace with your DigitalOcean Spaces access key ID
  secretAccessKey: "W2Ar0764cy4Y7rsWCecsoZxOZ3mJTJoqxWBo+uppV/c", // Replace with your DigitalOcean Spaces secret access key
});

exports.createProduct = async (req, res) => {
  try {
    const { name, description, specification, category } = req.body;
    let productPictures = [];
    let pdf = "";
    // Upload PDF file
    if (req.files && req.files["pdf"]) {
      const pdfFile = req.files["pdf"][0];
      const pdfContent = pdfFile.buffer;
      const pdfFilename = shortid.generate() + "-" + pdfFile.originalname;
      const pdfUploadParams = {
        Bucket: "colston-images", // Replace with your DigitalOcean Spaces bucket name
        Key: pdfFilename,
        Body: pdfContent,
        ACL: "public-read",
      };

      // Upload the PDF file to DigitalOcean Spaces
      const uploadedPDF = await s3.upload(pdfUploadParams).promise();

      // Set the PDF URL in the catalogueObj
      pdf = uploadedPDF.Location;
    }

    // Upload product pictures
    if (req.files && req.files["productPicture"]) {
      productPictures = req.files["productPicture"].map(async (file) => {
        const fileContent = file.buffer;
        const filename = shortid.generate() + "-" + file.originalname;
        const uploadParams = {
          Bucket: "colston-images", // Replace with your DigitalOcean Spaces bucket name
          Key: filename,
          Body: fileContent,
          ACL: "public-read",
        };

        // Upload the product picture to DigitalOcean Spaces
        const uploadedFile = await s3.upload(uploadParams).promise();

        return {
          img: uploadedFile.Location,
          imageAltText: file.originalname,
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
      colorDocs = colors?.map(async (color, index) => {
        const productPictures = req.files[`colorPicture${index}`]?.map(
          async (file, i) => {
            const fileContent = file.buffer;
            const filename = shortid.generate() + "-" + file.originalname;
            const uploadParams = {
              Bucket: "colston-images", // Replace with your DigitalOcean Spaces bucket name
              Key: filename,
              Body: fileContent,
              ACL: "public-read",
            };

            // Upload the product picture to DigitalOcean Spaces
            const uploadedFile = await s3.upload(uploadParams).promise();

            return {
              img: uploadedFile.Location,
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
        productPictures: req.files[`colorPicture0`]?.map(async (file, i) => {
          const fileContent = file.buffer;
          const filename = shortid.generate() + "-" + file.originalname;
          const uploadParams = {
            Bucket: "colston-images", // Replace with your DigitalOcean Spaces bucket name
            Key: filename,
            Body: fileContent,
            ACL: "public-read",
          };

          // Upload the product picture to DigitalOcean Spaces
          const uploadedFile = await s3.upload(uploadParams).promise();
          return {
            img: uploadedFile.Location,
            colorImageAltText: req.body.colorImageAltText[i] || "",
          };
        }),
      };
    } else if (col && req.files[`colorPicture0`]) {
      const fileContent = req.files[`colorPicture0`][0]?.buffer;
      const filename =
        shortid.generate() + "-" + req.files[`colorPicture0`][0]?.originalname;
      const uploadParams = {
        Bucket: "colston-images", // Replace with your DigitalOcean Spaces bucket name
        Key: filename,
        Body: fileContent,
        ACL: "public-read",
      };

      // Upload the product picture to DigitalOcean Spaces
      const uploadedFile = await s3.upload(uploadParams).promise();
      colorDocs = [
        {
          colorName: req.body.colorName ? req.body.colorName : "",
          productPictures: [
            {
              img: uploadedFile.Location,
              colorImageAltText: req.body.colorImageAltText || "",
            },
          ],
        },
      ];
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
exports.deleteProductById = async (req, res) => {
  try {
    const { productId } = req.body;
    if (productId) {
      const response = await Product.findOne({ _id: productId });

      if (response) {
        let pdf = response?.pdf.replace(
          "http://64.227.150.49:5000/public/",
          ""
        );

        const imagepath1 = path.join(__dirname, "../uploads", pdf);

        fs.unlink(imagepath1, (error) => {
          if (error) {
            console.error(error);
          }
        });

        response.productPictures.map((banner) => {
          let newValue = banner.img.replace(
            "http://64.227.150.49:5000/public/",
            ""
          );
          const imagePath2 = path.join(__dirname, "../uploads", newValue);
          fs.unlink(imagePath2, (error) => {
            if (error) {
              console.error(`Error deleting image file: ${error}`);
            } else {
              console.log(`Image file ${imagePath2} deleted successfully.`);
            }
          });
        });
        response.colors.forEach((banner) => {
          banner.productPictures.map((image) => {
            let newValue = image.img.replace(
              "http://64.227.150.49:5000/public/",
              ""
            );
            const imagePath3 = path.join(__dirname, "../uploads", newValue);
            fs.unlink(imagePath3, (error) => {
              if (error) {
                console.error(`Error deleting image file: ${error}`);
              } else {
                console.log(`Image file ${imagePath3} deleted successfully.`);
              }
            });
          });
        });

        Product.deleteOne({ _id: productId }).exec((error, result) => {
          if (error) return res.status(400).json({ error });
          if (result) {
            res.status(202).json({ result });
          }
        });
      } else {
        return res
          .status(400)
          .json({ error: "Delete operation fialed try again" });
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
    const pdf = req.files["pdf"]
      ? process.env.API + "/public/" + req.files["pdf"][0].filename
      : undefined;
    if (req.files) {
      productPictures =
        req.files["productPicture"] &&
        req.files["productPicture"]?.map((file, index) => {
          return {
            img: process.env.API + "/public/" + file.filename,
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
              img: process.env.API + "/public/" + picture.filename,
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
            img: process.env.API + "/public/" + picture.filename,
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
              img:
                process.env.API +
                "/public/" +
                req.files[`colorPicture0`][0]?.filename,
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
