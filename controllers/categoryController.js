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
      return next();
    },
  );
};

// Display Genre create form on GET.
exports.category_create_get = (req, res, next) => {
  res.render("category_form", { title: "Create category" });
};

// Handle Genre create on POST.
exports.category_create_post = [
  // Validate that the name field is not empty.
  validator.body("name", "Category name required").trim().isLength({ min: 1 }),

  // Sanitize (escape) the name field.
  validator.sanitizeBody("name").escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validator.validationResult(req);

    // Create a genre object with escaped and trimmed data.
    const category = new Category({ name: req.body.name });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render("category_form", {
        title: "Create Category",
        category,
        errors: errors.array(),
      });
    } else {
      // Data from form is valid.
      // Check if Category with same name already exists.
      Category.findOne({ name: req.body.name }).exec((err, foundCategory) => {
        if (err) {
          return next(err);
        }
        if (foundCategory) {
          // Category exists, redirect to its detail page.
          res.redirect(foundCategory.url);
        } else {
          category.save((error) => {
            if (error) {
              return next(error);
            }
            // Category saved. Redirect to category detail page.
            res.redirect(category.url);
            return next();
          });
        }
        return next();
      });
    }
  },
];
