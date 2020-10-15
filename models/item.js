const mongoose = require("mongoose");

const { Schema } = mongoose;

const ItemSchema = new Schema({
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
  category: {
    type: Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  numberInStock: {
    type: Number,
    required: true,
  },
});
// eslint-disable-next-line no-underscore-dangle
ItemSchema.virtual("url").get(function () {
  // eslint-disable-next-line no-underscore-dangle
  return `/inv/item/${this._id}`;
});

module.exports = mongoose.model("Item", ItemSchema);
