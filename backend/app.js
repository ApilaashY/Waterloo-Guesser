const express = require("express");
const cors = require("cors");
const fs = require("node:fs");
const app = express();
require("dotenv").config();
const mongoose = require("mongoose");
const Location = require("./Location");
const { runUploader } = require("./image-uploader.js");

const uri = `mongodb+srv://${process.env.USERNAME}:${process.env.PASSWORD}@cluster1.v3kqu.mongodb.net/?appName=Cluster1`;

mongoose.connect(uri);

runUploader();

app.use(cors());

app.get("/", async (req, res) => {
  res.json({ message: "Hello" });
});

app.get("/getPhoto", async (req, res) => {
  console.log("GET PHOTO");
  var data = await Location.findById("67e88876b9404a2bd31f1cec");
  if (data == null) {
    res.json({ data: "NO DATA" });
    return;
  }

  const b64 = Buffer.from(data["image"]["data"]).toString("base64");
  // CHANGE THIS IF THE IMAGE YOU ARE WORKING WITH IS .jpg OR WHATEVER
  const mimeType = "image/jpg"; // e.g., image/png

  res.json({ image: `data:${mimeType};base64,${b64}` });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, console.log(`Server started on port ${PORT}`));
