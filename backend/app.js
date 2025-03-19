const express = require("express");
const cors = require("cors");
const fs = require("node:fs");
const app = express();
require("dotenv").config();
const mongoose = require("mongoose");
const Location = require("./Location");

const uri = `mongodb+srv://${process.env.USERNAME}:${process.env.PASSWORD}@cluster1.v3kqu.mongodb.net/?appName=Cluster1`;

mongoose.connect(uri);

async function run() {
  var loc = new Location({
    name: "Mumbai",
    description: "City of Dreams",
  });
  await loc.save();
  console.log("DONE");
}
run();

app.use(cors());

const folderName = "photos";
const photos = fs.readdirSync(folderName);

app.get("/", (req, res) => {
  res.send({ Done: "There" });
});

app.get("/getPhoto", (req, res) => {
  fs.readFile("photos/" + photos[0], "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    res.contentType("image/jpeg"); // Set content type for image
    res.json({ data });
  });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, console.log(`Server started on port ${PORT}`));
