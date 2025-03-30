const mong = require("mongoose");

const locationSchema = new mong.Schema({
  name: { type: String, required: true },
  description: String,
  image: {
    data: Buffer,
    contentType: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mong.model("Location", locationSchema);
