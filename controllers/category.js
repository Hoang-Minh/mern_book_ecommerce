const Category = require("../models/category");
const { errorHandler } = require("../helpers/dbErrorHandler");

exports.categoryById = async (req, res, next, id) => {
  try {
    const data = await Category.findById(id);
    if (!data) return res.status(400).json({ error: "Category does not exist" });
    req.category = data;
    next();
  } catch (error) {
    return res.status(400).json({ error: "Category does not exist" });
  }
};

exports.create = async (req, res) => {
  const category = new Category(req.body);
  try {
    const data = await category.save();
    res.json({ data });
  } catch (error) {
    return res.status(400).json({ error: errorHandler(error) });
  }
};

exports.read = (req, res) => {
  return res.json(req.category);
};

exports.update = async (req, res) => {
  const category = req.category;
  category.name = req.body.name;
  try {
    const data = await category.save();
    res.json(data);
  } catch (error) {
    return res.status(400).json({ error: errorHandler(error) });
  }
};

exports.remove = async (req, res) => {
  const category = req.category;
  try {
    await category.deleteOne();
    res.json({ message: "Category deleted" });
  } catch (error) {
    return res.status(400).json({ error: errorHandler(error) });
  }
};

exports.list = async (req, res) => {
  try {
    const data = await Category.find();
    res.json(data);
  } catch (error) {
    return res.status(400).json({ error: errorHandler(error) });
  }
};
