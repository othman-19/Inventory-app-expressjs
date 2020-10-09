const mongoose = require("mongoose");

const { Schema } = mongoose;

const CategorySchema = new Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 100,
  },
  description: {
    type: String,
    required: true,
    maxlength: 300,
  },
});

// eslint-disable-next-line no-underscore-dangle
CategorySchema.virtual("url").get(() => `/inv/category/${this._id}`);

module.exports = mongoose.model("Category", CategorySchema);
