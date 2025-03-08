const express = require("express");
const cors = require("cors");
const fs = require("node:fs");
const { config } = require("dotenv");
var mongo = require("mongodb").MongoClient;
require("dotenv/config");

config();

const app = express();

mongo.connect(
  "mongodb+srv://Apilaash:Dinosaurs@16@cluster1.v3kqu.mongodb.net/?",
  function (err, db) {
    if (err) throw err;

    console.log(db);

    db.close();
  }
);

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
