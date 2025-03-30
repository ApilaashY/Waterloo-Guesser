const mong = require("mongoose");

const locationSchema = new mong.Schema({
  name: { type: String, required: true },
  building: { type: String, required: true },
  image: {
    data: Buffer,
    contentType: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  latitude: {type: String, required: true},
  longitude: {type: String, required: true},
});

module.exports = mong.model("Location", locationSchema);
