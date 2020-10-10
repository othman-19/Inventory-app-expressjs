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

// Display detail page for a specific category.
exports.category_detail = (req, res, next) => {
  async.parallel(
    {
      category(callback) {
        Category.findById(req.params.id).exec(callback);
      },

      category_items(callback) {
        Item.find({ category: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.category === null) {
        // No results.
        const error = new Error("Category not found");
        error.status = 404;
        return next(error);
      }
      // Successful, so render
      res.render("category_detail", {
        title: "Category Detail",
        category: results.category,
        category_items: results.category_items,
      });
      return true;
    },
  );
};

// Display Genre create form on GET.
exports.category_create_get = (req, res, next) => {
  res.render("category_form", { title: "Create category" });
};
