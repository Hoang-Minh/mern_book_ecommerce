const Cateogry = require("../models/category");
const { errorHandler } = require("../helpers/dbErrorHandler");
//const { errorHandler } = require("../helpers/dbErrorHandler");

exports.categoryById = (req, res, next, id) => {
  Cateogry.findById(id).exec((error, data) => {
    if (error || !data)
      return res.status(400).json({ error: "Category does not exist" });
    req.category = data;
    next();
  });
};

exports.create = (req, res, next) => {
  const category = new Cateogry(req.body);

  category.save((error, data) => {
    if (error) {
      res.status(400);
      return res.status(400).json({ error: errorHandler(error) });
    }

    res.json({ data });
  });
};

exports.read = (req, res) => {
  return res.json(req.category);
};

exports.update = (req, res) => {
  const category = req.category;
  console.log(req.body);
  category.name = req.body.name;
  category.save((error, data) => {
    if (error || !data)
      return res.status(400).json({ error: errorHandler(error) });

    res.json(data);
  });
};

exports.remove = (req, res) => {
  const category = req.category;

  category.remove((error, data) => {
    if (error || !data)
      return res.satus(400).json({ error: errorHandler(error) });

    res.json({ message: "Category deleted" });
  });
};
exports.list = (req, res) => {
  Cateogry.find().exec((error, data) => {
    if (error || !data)
      return res.status(400).json({ error: errorHandler(error) });

    res.json(data);
  });
};
