const Product = require("../models/product");
const shortid = require("shortid");
const slugify = require("slugify");
let sortBy = require("lodash.sortby");
const Category = require("../models/category");
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
      productPictures = await Promise.all(
        req.files["productPicture"].map(async (file, index) => {
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
            imageAltText: req.body.imageAltText[index],
          };
        })
      );
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
      colorDocs = await Promise.all(
        colors?.map(async (color, index) => {
          const productPictures = await Promise.all(
            req.files[`colorPicture${index}`]?.map(async (file, i) => {
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
            })
          );

          return {
            colorName: color,
            productPictures,
          };
        })
      );
    } else if (col && req.files[`colorPicture0`]?.length > 1) {
      colorDocs = {
        colorName: req.body.colorName ? req.body.colorName : "",
        productPictures: await Promise.all(
          req.files[`colorPicture0`]?.map(async (file, i) => {
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
          })
        ),
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

// exports.getProductDetailsById = (req, res) => {
//   try {
//     const { productId } = req.params;

//     if (productId) {
//       console.log("productId ", productId);
//       Product.findOne({ _id: productId }).exec((error, product) => {
//         console.log("product ", product);
//         if (error) return res.status(400).json({ error });
//         if (product) {
//           console.log("product ", product);
//           Product.find({ category: product.category }).exec(
//             (error, relatedProducts) => {
//               if (error) {
//                 return res.status(400).json({ error });
//               } else {
//                 res
//                   .status(200)
//                   .json({ product, relatedProducts: relatedProducts });
//               }
//             }
//           );
//         }
//       });
//     } else {
//       return res.status(400).json({ error: "Params required" });
//     }
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


exports.getProductDetailsById = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({ error: "Params required" });
    }

    const product = await Product.findOne({ _id: productId }).exec();

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const relatedProducts = await Product.find({ category: product.category }).exec();

    res.status(200).json({ product, relatedProducts });
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
        // Delete the associated image data from DigitalOcean Spaces
        if (response.pdf) {
          const key = response.pdf.split("/").pop();
          const deleteParams = {
            Bucket: "colston-images", // Replace with your DigitalOcean Spaces bucket name
            Key: key,
          };

          await s3.deleteObject(deleteParams).promise();
        }

        response.productPictures.map(async (banner) => {
          if (banner.img) {
            const key = banner.img.split("/").pop();
            const deleteParams = {
              Bucket: "colston-images", // Replace with your DigitalOcean Spaces bucket name
              Key: key,
            };

            await s3.deleteObject(deleteParams).promise();
          }
        });

        response.colors.forEach((banner) => {
          banner.productPictures.map(async (image) => {
            if (image.img) {
              const key = image.img.split("/").pop();
              const deleteParams = {
                Bucket: "colston-images", // Replace with your DigitalOcean Spaces bucket name
                Key: key,
              };

              await s3.deleteObject(deleteParams).promise();
            }
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
    // let sortedByDates = sortBy(products, "updatedAt");
    console.log("products ", products);
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

    const product = {
      createdBy: req.user._id,
    };
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
    if (
      req.files &&
      req.files["productPicture"] &&
      req.files["productPicture"][0].img != ""
    ) {
      productPictures = await Promise.all(
        req.files["productPicture"].map(async (file, index) => {
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
          const imageAltText = req.body.imageAltText;
          return {
            img: uploadedFile.Location,
            imageAltText:
              typeof imageAltText === "string"
                ? imageAltText
                : Array.isArray(imageAltText)
                ? imageAltText[index]
                : "",
          };
        })
      );
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
      colorDocs = await Promise.all(
        colors?.map(async (color, index) => {
          const productPictures = await Promise.all(
            req.files[`colorPicture${index}`]?.map(async (file, i) => {
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
            })
          );

          return {
            colorName: color,
            productPictures,
          };
        })
      );
    } else if (col && req.files[`colorPicture0`]?.length > 1) {
      colorDocs = {
        colorName: req.body.colorName ? req.body.colorName : "",
        productPictures: await Promise.all(
          req.files[`colorPicture0`]?.map(async (file, i) => {
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
          })
        ),
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

    if (pdf != undefined) {
      product.pdf = pdf;
    }
    if (productPictures) {
      product.productPictures = productPictures;
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
      .select("_id name productPictures category customOrder");

    const count = await products.length;
    const totalPages = Math.ceil(count / limit);
    const individualCat = await Category.findOne({ _id: id });

    if (!individualCat) {
      return res.status(404).json({ message: "Category not found" });
    }
    products.sort((a, b) => a.customOrder - b.customOrder);

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

exports.updateOrder = async (req, res) => {
  try {
    const { productOrder } = req.body;
    for (let index = 0; index < productOrder.length; index++) {
      const id = productOrder[index];
      await Product.updateOne(
        { _id: id },
        { $set: { customOrder: index + 1 } }
      );
    }
    return res.status(201).json({
      message: "Product order changed successfully",
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
