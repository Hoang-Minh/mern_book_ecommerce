const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");
const Product = require("../models/product");
const { errorHandler } = require("../helpers/dbErrorHandler");

exports.productById = (req, res, next, id) => {
  Product.findById(id).exec((error, product) => {
    if (error || !product)
      return res.status(400).json({ error: "Product not found" });

    req.product = product;
    next();
  });
};

exports.create = (req, res) => {
  const form = new formidable.IncomingForm();
  form.keepExtensions = true; // keep the file extension
  form.parse(req, (error, fields, files) => {
    if (error)
      return res.status(400).json({ error: "Image could not be uploaded" });

    // check for all fields
    const { name, description, price, category, quantity, shipping } = fields;

    if (!name || !description || !price || !category || !quantity || !shipping)
      return res.status(400).json({ error: "All fields are required" });

    const product = new Product(fields);

    // the "photo" name coming/depending from the client side
    if (files.photo) {
      //console.log("Files photo:", files.photo);
      if (files.photo.size > 1000000)
        return res
          .satus(400)
          .json({ error: "Image size must be less than 1 MB" });
      product.photo.data = fs.readFileSync(files.photo.path);
      product.photo.contentType = files.photo.type;
    }

    product.save((error, result) => {
      if (error) return res.status(400).json({ error: errorHandler(error) });

      res.json(result);
    });
  });
};

exports.read = (req, res) => {
  req.product.photo = undefined;
  return res.json(req.product);
};

exports.remove = (req, res) => {
  const product = req.product;
  product.remove((error, deletedProuduct) => {
    if (error) return res.status(400).json({ error: errorHandler(error) });

    res.json({ message: "Product deleted successfully" });
  });
};
