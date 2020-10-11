const async = require("async");
const { body, validationResult } = require("express-validator");
const Item = require("../models/item");
const Category = require("../models/category");

// Display list of all items.
exports.item_list = (req, res, next) => {
  Item.find({}, "name")
    .populate("category")
    .exec((err, itemList) => {
      if (err) {
        return next(err);
      }
      // Successful, so render
      return res.render("item_list", { title: "Item List", itemList });
    });
};

// Display detail page for a specific item.
exports.item_detail = (req, res, next) => {
  Item.findById(req.params.id, (err, item) => {
    if (err) {
      return next(err);
    }
    if (item === null) {
      // No results.
      const error = new Error("Item not found");
      error.status = 404;
      return next(error);
    }
    // Successful, so render.
    return res.render("item_detail", {
      title: item.name,
      item,
    });
  })
    .populate("category")
    .exec();
};

// Display item create form on GET.
exports.item_create_get = (req, res, next) => {
  Category.find({}, (err, categories) => {
    if (err) {
      return next(err);
    }
    return res.render("item_form", {
      title: "Create Item",
      categories,
    });
  });
};

// Handle item create on POST.
exports.item_create_post = [
  // Convert the category to an array.
  // (req, res, next) => {
  //   if (!(req.body.category instanceof Array)) {
  //     if (typeof req.body.category === "undefined") req.body.category = [];
  //     else req.body.category = new Array(req.body.category);
  //   }
  //   next();
  // },

  // Validate fields.
  body("name", "Name must not be empty.").trim().isLength({ min: 1 }).escape(),
  body("description", "Description must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("category", "Category must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("price", "Price must not be empty").trim().isLength({ min: 1 }).escape(),
  body("numberInStock", "Number In Stock must not be empty")
    .isNumeric()
    .trim()
    .isLength({ min: 1 }),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);
    // Create a Item object with escaped and trimmed data.
    const item = new Item({
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      price: req.body.price,
      numberInStock: req.body.numberInStock,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.
      Category.find({}, (err, categories) => {
        if (err) {
          return next(err);
        }
        return res.render("item_form", {
          title: "Create Item",
          item,
          categories,
          errors: errors.array(),
        });
      });
      // Get all authors and genres for form.
    } else {
      // Data from form is valid. Save item.
      item.save((err) => {
        if (err) {
          return next(err);
        }
        // successful - redirect to new item record.
        return res.redirect(item.url);
      });
    }
  },
];
