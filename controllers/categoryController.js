const async = require("async");
const { body, validationResult } = require("express-validator");
const Category = require("../models/category");
const Item = require("../models/item");

exports.index = (req, res) => {
  async.parallel(
    {
      item_list(callback) {
        Item.find({}, "name").populate("category").exec(callback);
      },
      category_count(callback) {
        Category.countDocuments({}, callback);
      },
      item_count(callback) {
        Item.countDocuments({}, callback);
      },
    },
    (err, results) => {
      res.render("index", {
        title: "Inventory Home",
        error: err,
        data: results,
      });
    },
  );
};

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

// Display Category create form on GET.
exports.category_create_get = (req, res, next) => {
  res.render("category_form", { title: "Create category" });
};

// Handle Category create on POST.
exports.category_create_post = [
  // Validate that the name field is not empty.
  body("name", "Category name required")
    .trim()
    .isLength({ min: 1 })
    .notEmpty()
    .escape(),
  body("description", "Category description required")
    .trim()
    .isLength({ min: 1 })
    .notEmpty()
    .escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a category object with escaped and trimmed data.
    const category = new Category({
      name: req.body.name,
      description: req.body.description,
    });

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

// Display category delete form on GET.
exports.category_delete_get = (req, res, next) => {
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
        res.redirect("/inv/categories");
      }
      // Successful, so render.
      res.render("category_delete", {
        title: "Delete Category",
        category: results.category,
        category_items: results.category_items,
      });
      return next(err);
    },
  );
};

// Handle Category delete on POST.
exports.category_delete_post = (req, res, next) => {
  async.parallel(
    {
      category(callback) {
        Category.findById(req.body.categoryid).exec(callback);
      },
      category_items(callback) {
        Item.find({ category: req.body.categoryid }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      // Success
      if (results.category_items.length > 0) {
        // category has items. Render in same way as for GET route.
        res.render("category_delete", {
          title: "Delete Category",
          category: results.category,
          category_items: results.category_items,
        });
      } else {
        // Category has no items. Delete object and redirect to the list of categories.
        Category.findByIdAndRemove(req.body.categoryid, (error) => {
          if (error) {
            return next(error);
          }
          // Success - go to categories list
          res.redirect("/inv/categories");
          return next();
        });
      }
      return next();
    },
  );
};

// Display Category update form on GET.
exports.category_update_get = (req, res, next) => {
  Category.findById(req.params.id, (err, category) => {
    if (err) {
      return next(err);
    }
    if (category === null) {
      res.redirect("/inv/categories");
    } else {
      res.render("category_form", { title: "Update Category", category });
    }
    return next();
  }).exec();
};

// Handle Category update on POST.
exports.category_update_post = [
  // Sanitize and alidate that the name and description fields are not empty.
  body("name", "Category name required")
    .trim()
    .isLength({ min: 1 })
    .notEmpty()
    .escape(),
  body("description", "Category description required")
    .trim()
    .isLength({ min: 1 })
    .notEmpty()
    .escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a category object with escaped and trimmed data.
    const category = new Category({
      name: req.body.name,
      description: req.body.description,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render("category_form", {
        title: "Update Category",
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
          Category.findByIdAndUpdate(
            req.params.id,
            category,
            {},
            (error, updatedCategory) => {
              if (error) {
                return next(error);
              }
              // Successful - redirect to category detail page.
              res.redirect(updatedCategory.url);
              return next();
            },
          );
        }
        return next();
      });
    }
  },
];
