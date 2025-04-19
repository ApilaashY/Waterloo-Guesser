const express = require("express");
const cors = require("cors");
const fs = require("node:fs");
require("dotenv").config();
const mongoose = require("mongoose");
const app = express();
const Location = require("./Location");

const uri = `mongodb+srv://${process.env.USERNAME}:${process.env.PASSWORD}@cluster1.v3kqu.mongodb.net/?appName=Cluster1`;

mongoose.connect(uri);

// Linear Model
// a = 0, b = -10/3, c = 7/6
// Quadratic Model
// a = -25/3, b = 0, c = 49/48

const maxPoints = 1000;
const a = 0;
const b = -10 / 3;
const c = 7 / 6;

function boundModel(num) {
  if (num <= 0) return 0;
  else if (num >= 1) return 1;
  return num;
}

var allData = {};

async function setupImages() {
  var data = await Location.find({});

  allData = data;
}

async function initializeApp() {
  await setupImages();

  app.use(express.json());
  app.use(cors());

  app.get("/", async (req, res) => {
    res.json({ message: "Hello" });
  });

  app.get("/getPhoto", async (req, res) => {
    var data = allData[(Math.random() * allData.length) | 0];

    while (allData.length > 1 && data._id == req.query.previousCode) {
      data = allData[(Math.random() * allData.length) | 0];
    }

    const b64 = Buffer.from(data["image"]["data"]).toString("base64");
    const mimeType = data["image"]["contentType"];

    res.json({
      image: `data:${mimeType};base64,${b64}`,
      id: data._id,
    });
  });

  app.post("/validateCoordinate", async (req, res) => {
    allData.forEach((data) => {
      if (data._id == req.body.id) {
        const distance = Math.sqrt(
          Math.pow(data.xCoordinate - req.body.xCoor, 2) +
            Math.pow(data.yCoordinate - req.body.yCoor, 2)
        );
        res.json({
          xCoor: data.xCoordinate,
          yCoor: data.yCoordinate,
          points: Math.round(
            maxPoints * boundModel(a * Math.pow(distance, 2) + b * distance + c)
          ),
          distance: distance,
        });
      }
    });
  });

  const PORT = process.env.PORT || 8080;

  app.listen(PORT, console.log(`Server started on port ${PORT}`));

  module.exports = { uri };
}
initializeApp();
