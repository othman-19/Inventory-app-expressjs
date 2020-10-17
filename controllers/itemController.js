/* eslint-disable no-underscore-dangle */
const async = require("async");
const { body, validationResult } = require("express-validator");
const path = require("path");
const multer = require("multer");
const Item = require("../models/item");
const Category = require("../models/category");

// Image Storage
const storage = multer.diskStorage({
  destination: "./public/uploads/",
  filename(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`,
    );
  },
});

// Check File Type
const checkFileType = (file, cb) => {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  }
  return cb("Error: Images Only!");
};

// Init Upload
exports.upload = multer({
  storage,
  limits: { fileSize: 1000000 },
  fileFilter(req, file, cb) {
    checkFileType(file, cb);
  },
}).array("images", 6);

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

  // Validate and sanitize fields.
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
    const images = req.files ? req.files.map((file) => file.path) : [];
    const item = new Item({
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      price: req.body.price,
      numberInStock: req.body.numberInStock,
      images,
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
// Display item delete form on GET.
exports.item_delete_get = (req, res, next) => {
  Item.findById(req.params.id, (err, item) => {
    if (err) {
      return next(err);
    }
    if (item === null) {
      // No results.
      res.redirect("/inv/items");
    }
    // Successful, so render.
    return res.render("item_delete", {
      title: "Delete Item",
      item,
    });
  }).exec();
};

// Handle item delete on POST.
exports.item_delete_post = (req, res, next) => {
  Item.findByIdAndRemove(req.body.itemid, (error, item) => {
    if (error) {
      return next(error);
    }
    if (item === null) {
      // No results.
      res.redirect(`/inv/items/${req.body.itemid}`);
    }
    // Success - go to category list
    return res.redirect("/inv/categories");
  }).exec();
};

// Display item update form on GET.
exports.item_update_get = (req, res, next) => {
  // Get item and categories for form.
  async.parallel(
    {
      item(callback) {
        Item.findById(req.params.id).populate("category").exec(callback);
      },
      categories(callback) {
        Category.find(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.item === null) {
        // No results.
        const error = new Error("Item not found");
        error.status = 404;
        return next(err);
      }
      // Success.
      // Mark our selected category as checked.
      for (let i = 0; i < results.categories.length; i += 1) {
        if (
          // eslint-disable-next-line operator-linebreak
          results.categories[i]._id.toString() ===
          results.item.category._id.toString()
        ) {
          results.categories[i].checked = "true";
        }
      }
      return res.render("item_form", {
        title: "Update Item",
        categories: results.categories,
        item: results.item,
      });
    },
  );
};

// Handle item update on POST.
exports.item_update_post = [
  // Convert the category to an array.
  // (req, res, next) => {
  //   if (!(req.body.category instanceof Array)) {
  //     if (typeof req.body.category === "undefined") req.body.category = [];
  //     else req.body.category = new Array(req.body.category);
  //   }
  //   next();
  // },

  // Validate and sanitize fields.
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
    const images = req.files ? req.files.map((file) => file.path) : [];
    const item = new Item({
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      price: req.body.price,
      numberInStock: req.body.numberInStock,
      images,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all categories for form.
      Category.find((err, categories) => {
        if (err) {
          return next(err);
        }
        for (let i = 0; i < categories.length; i += 1) {
          if (categories[i]._id.toString() === item.category._id.toString()) {
            categories[i].checked = "true";
          }
        }
        return res.render("item_form", {
          title: "Update Item",
          categories,
          item,
          errors: errors.array(),
        });
      });
    } else {
      // Data from form is valid. Update the record.
      Item.findByIdAndUpdate(req.params.id, item, {}, (err, updatedItem) => {
        if (err) {
          return next(err);
        }
        // Successful - redirect to item detail page.
        return res.redirect(updatedItem.url);
      });
    }
  },
];
