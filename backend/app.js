const express = require("express");
const cors = require("cors");
const fs = require("node:fs");
require("dotenv").config();
const mongoose = require("mongoose");
const app = express();
const LocationModel = require("./Location");

const uri = `mongodb+srv://${process.env.ATLASNAME}:${process.env.PASSWORD}@cluster1.v3kqu.mongodb.net/?appName=Cluster1`;

mongoose.connect(uri);

function generateModel(perfectRadius, maxTillNoPoints, model) {
  if (model == "linear") {
    const slope = -1 / (maxTillNoPoints - perfectRadius);

    return [0, slope, -slope * maxTillNoPoints];
  } else if (model == "quadratic") {
    const coefficient =
      1 / (Math.pow(perfectRadius, 2) - Math.pow(maxTillNoPoints, 2));

    return [coefficient, 0, -(coefficient * Math.pow(maxTillNoPoints, 2))];
  }
  return [0, 0, 0];
}

const maxPoints = 1000;
const [a, b, c] = generateModel(0.02, 0.15, "linear");

function boundModel(num) {
  if (num <= 0) return 0;
  else if (num >= 1) return 1;
  return num;
}

function contains(lst, val) {
  for (var i = 0; i < lst.length; i++) {
    if (lst[i] == val) {
      return true;
    }
  }
  return false;
}

var allData = [];

async function setupImages() {
  var data = await LocationModel.find({});

  allData = data;
}

async function initializeApp() {
  await setupImages();

  app.use(express.json());
  app.use(
    cors({
      origin: "https://waterloo-guesser.vercel.app",
    })
  );

  app.get("/", async (req, res) => {
    res.json({ message: "Hello" });
  });

  app.post("/getPhoto", async (req, res) => {
    var uniqueIds = allData.filter((id) => {
      return !contains(req.body.previousCodes, id._id);
    });

    var data;
    if (uniqueIds.length > 0) {
      data = uniqueIds[(Math.random() * uniqueIds.length) | 0];
    } else {
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
}
initializeApp();
