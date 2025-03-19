const mong = require("mongoose");

const locationSchema = new mong.Schema({
  name: String,
  description: String,
  image: String,
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mong.model("Location", locationSchema);
