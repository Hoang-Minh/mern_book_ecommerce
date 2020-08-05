const Cateogry = require("../models/category");
const { errorHandler } = require("../helpers/dbErrorHandler");

exports.create = (req, res) => {
  const category = new Cateogry(req.body);
  category.save((error, data) => {
    if (error) return res.status(400).json({ error: errorHandler });

    res.json({ data });
  });
};
