#! /usr/bin/env node

const async = require("async");
const mongoose = require("mongoose");
const Item = require("./models/item");
const Category = require("./models/category");

console.log(
  "This script populates some test items and categories to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0-mbdj7.mongodb.net/local_library?retryWrites=true",
);

// Get arguments passed on command line
const userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/

const mongoDB = userArgs[0];
mongoose.connect(mongoDB, { useNewUrlParser: true });
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

const items = [];
const categories = [];

const categoryCreate = (name, description, callback) => {
  const category = new Category({ name, description });
  category.save((err) => {
    if (err) {
      callback(err, null);
      return;
    }
    console.log(`New Genre: ${category}`);
    categories.push(category);
    callback(null, category);
  });
};

const itemCreate = (
  name,
  description,
  category,
  price,
  numberInStock,
  callback,
) => {
  const itemDetail = {
    name,
    description,
    price,
    numberInStock,
  };
  if (category !== false) itemDetail.category = category;
  const item = new Item(itemDetail);
  item.save((err) => {
    if (err) {
      callback(err, null);
      return;
    }
    console.log(`New Book: ${item}`);
    items.push(item);
    callback(null, item);
  });
};

function createItems(callback) {
  async.parallel(
    [
      (callback) => {
        itemCreate(
          "Samsung - Galaxy Tab A (2019)",
          "32GB - Black - Model: SM-T510NZKAXAR - SKU: 6335112",
          categories[0], // tablet
          "1000$",
          500,
          callback,
        );
      },
      (callback) => {
        itemCreate(
          "Apple - 10.2-Inch iPad",
          "Latest Model with Wi-Fi - 32GB - Model: MYL92LL/A - SKU: 5199701 - Color:Space Gray",
          categories[1], // ipad
          "1200$",
          500,
          callback,
        );
      },
      (callback) => {
        itemCreate(
          "Apple - 10.2-Inch iPad",
          "16GB - Black Model: SM-T560NZKUXAR - SKU: 4515201",
          categories[1], // ipad
          "1100$",
          500,
          callback,
        );
      },
      (callback) => {
        itemCreate(
          "Microsoft - Surface Laptop 3",
          "Touch-Screen - AMD Ryzen™ 5 Surface Edition - 8GB Memory - 128GB SSD (Latest Model) - Platinum - Model: V4G-00001 SKU: 6374332",
          categories[2], // laptop
          "2000$",
          500,
          callback,
        );
      },
      (callback) => {
        itemCreate(
          "HP - 15.6 - Touch-Screen Laptop",
          "Intel Core i5 - 12GB Memory - 256GB SSD - Natural Silver -Model: 15-dy1043dx SKU: 6413692",
          categories[2], // laptop
          "2000$",
          500,
          callback,
        );
      },
      (callback) => {
        itemCreate(
          "HP - 25x 24.5",
          "LED FHD Monitor - Gray/Green - Model: HP 25X SKU: 6280605",
          categories[3], // gaming_monitors
          "1400$",
          500,
          callback,
        );
      },
      (callback) => {
        itemCreate(
          "Sony Interactive Entertainment",
          "PlayStation VR Marvel's Iron Man VR Bundle Model: 3004152 - SKU: 6415435",
          categories[4], // PlayStation_VR
          "400$",
          500,
          callback,
        );
      },
    ],
    // optional callback
    callback,
  );
}

const createCategories = (callback) => {
  async.series(
    [
      (callback) => {
        categoryCreate(
          "Tablet",
          "Thinking about adding a tablet to your collection of tech devices? Computer tablets are portable, with a screen larger than the average smartphone, and that enables you to enjoy games, music and movies, whenever and wherever you wish, without requiring a separate keyboard, mouse or monitor.",
          callback,
        );
      },
      (callback) => {
        categoryCreate(
          "iPad",
          "The iPad is one of many tablet brands available at Best Buy. It might be the ideal choice if you already have a Mac or iPhone because it uses the same operating system, Apple iOS.",
          callback,
        );
      },
      (callback) => {
        categoryCreate(
          "Laptop",
          "Mobile computing has become essential in today's world, so why might you choose a laptop computer instead of a tablet or a smartphone for your on-the-go computer support? For one thing, laptops include a keyboard, considered by many to be quicker and easier than a touchpad for computing tasks.",
          callback,
        );
      },
      (callback) => {
        categoryCreate(
          "Game_monitoring",
          "Picking the best gaming monitor is an investment in your PC gaming future—think of it like a gaming 401(k). While some components in your rig might get swapped out every couple of years or so, a great gaming monitor will likely last much longer.",
          callback,
        );
      },
      (callback) => {
        categoryCreate(
          "PlayStation_VR",
          "Virtual reality, or VR, is a technology that lets you figuratively step inside a computer-generated 3D world. You can explore and sometimes even manipulate objects in that world.",
          callback,
        );
      },
    ],
    // optional callback
    callback,
  );
};

async.series(
  [createCategories, createItems],
  // Optional callback
  (err, results) => {
    if (err) {
      console.log(`FINAL ERR: ${err}`);
    } else {
      console.log(`categories: ${categories}`);
      console.log(`Items: ${items}`);
    }
    // All done, disconnect from database
    mongoose.connection.close();
  },
);
