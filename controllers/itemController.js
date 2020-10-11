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
      res.render("item_list", { title: "Item List", itemList });
      return next();
    });
};
