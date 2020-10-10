const async = require("async");
const validator = require("express-validator");
const Category = require("../models/category");
const Item = require("../models/item");

// Display list of all Categories.
exports.category_list = (req, res, next) => {
  Category.find({}, "name")
    .populate("category")
    .exec((err, categoryList) => {
      if (err) {
        return next(err);
      }
      // Successful, so render
      res.render("category_list", {
        title: "Category List",
        categoryList,
      });
      return true;
    });
};
