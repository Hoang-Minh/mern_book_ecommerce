const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");
const Product = require("../models/product");
const { errorHandler } = require("../helpers/dbErrorHandler");
const { request } = require("http");

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

exports.update = (req, res) => {
  const form = new formidable.IncomingForm();
  form.keepExtensions = true; // keep the file extension
  form.parse(req, (error, fields, files) => {
    if (error)
      return res.status(400).json({ error: "Image could not be uploaded" });

    // check for all fields
    const { name, description, price, category, quantity, shipping } = fields;

    if (!name || !description || !price || !category || !quantity || !shipping)
      return res.status(400).json({ error: "All fields are required" });

    let product = req.product;
    product = _.extend(product, fields);

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

exports.list = (req, res) => {
  const order = req.query.order ? req.query.order : "asc";
  const sortBy = req.query.sortBy ? req.query.sortBy : "_id";
  const limit = req.query.limit ? parseInt(req.query.limit) : 6;

  Product.find()
    .select("-photo")
    .populate("category")
    .sort([[sortBy, order]])
    .limit(limit)
    .exec((error, products) => {
      if (error) return res.status(400).json({ error: "Products not found" });

      res.json(products); // res.send(products)
    });
};

// will the products baded on the req product cateogry
// other products that has the same category will be returned.
exports.listRelated = (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit) : 6;
  Product.find({ _id: { $ne: req.product }, category: req.product.category })
    .limit(limit)
    .populate("category", "_id name")
    .exec((error, products) => {
      if (error) return res.status(400).json({ error: "Product not found" });

      res.json(products);
    });
};

exports.listCategories = (req, res) => {
  Product.distinct("category", {}, (error, categories) => {
    if (error) return res.status(400).json({ error: "Categories not found" });

    res.json(categories);
  });
};

/**
 * list products by search
 * we will implement product search in react frontend
 * we will show categories in checkbox and price range in radio buttons
 * as the user clicks on those checkbox and radio buttons
 * we will make api request and show the products to users based on what he wants
 */

exports.listBySearch = (req, res) => {
  const order = req.body.order ? req.body.order : "desc";
  const sortBy = req.body.sortBy ? req.body.sortBy : "_id";
  const limit = req.body.limit ? parseInt(req.body.limit) : 100;
  const skip = parseInt(req.body.skip);
  const findArgs = {};

  // console.log(order, sortBy, limit, skip, req.body.filters);
  // console.log("findArgs", findArgs);

  for (let key in req.body.filters) {
    if (req.body.filters[key].length > 0) {
      if (key === "price") {
        // gte -  greater than price [0-10]
        // lte - less than
        findArgs[key] = {
          $gte: req.body.filters[key][0],
          $lte: req.body.filters[key][1],
        };
      } else {
        findArgs[key] = req.body.filters[key];
      }
    }
  }

  Product.find(findArgs)
    .select("-photo")
    .populate("category")
    .sort([[sortBy, order]])
    .skip(skip)
    .limit(limit)
    .exec((error, data) => {
      if (error) {
        return res.status(400).json({
          error: "Products not found",
        });
      }
      res.json({
        size: data.length,
        data,
      });
    });
};

exports.photo = (req, res, next) => {
  if (req.product.photo.data) {
    res.set("Content-Type", req.product.photo.contentType);
    return res.send(req.product.photo.data);
  }

  next();
};
