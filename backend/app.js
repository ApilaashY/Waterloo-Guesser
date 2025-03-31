const express = require("express");
const cors = require("cors");
const fs = require("node:fs");
const app = express();
require("dotenv").config();
const mongoose = require("mongoose");
const Location = require("./Location");

const uri = `mongodb+srv://${process.env.USERNAME}:${process.env.PASSWORD}@cluster1.v3kqu.mongodb.net/?appName=Cluster1`;

mongoose.connect(uri);

var allData = {};

async function setupImages() {
  var data = await Location.find({});

  allData = data;
}

setupImages();

app.use(cors());

app.get("/", async (req, res) => {
  res.json({ message: "Hello" });
});

app.get("/getPhoto", async (req, res) => {
  var data = allData[(Math.random() * allData.length) | 0];

  const b64 = Buffer.from(data["image"]["data"]).toString("base64");
  const mimeType = data["image"]["contentType"];

  res.json({ image: `data:${mimeType};base64,${b64}` });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, console.log(`Server started on port ${PORT}`));

module.exports = { uri };
