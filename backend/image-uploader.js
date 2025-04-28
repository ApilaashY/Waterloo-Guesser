const fs = require("fs");
const Location = require("./Location");
const mongoose = require("mongoose");
require("dotenv").config();

const uri = `mongodb+srv://${process.env.ATLASNAME}:${process.env.PASSWORD}@cluster1.v3kqu.mongodb.net/?appName=Cluster1`;

mongoose.connect(uri);

const DATA = [
  {
    name: "outsy",
    building: "OUT - Outdoor",
    image: "IMG_1360.jpg",
    latitude: `43°28'15.8"N`,
    longitude: `80°32'42.1"W`,
    xCoordinate: 0.41818181818181815,
    yCoordinate: 0.47,
  },
  {
    name: "outsy2",
    building: "OUT - Outdoor",
    image: "IMG_1361.jpg",
    latitude: `43°28'12.2"N`,
    longitude: `80°32'48.5"W`,
    xCoordinate: 0.31636363636363635,
    yCoordinate: 0.466,
  },
  {
    name: "outsy3",
    building: "OUT - Outdoor",
    image: "IMG_1365.jpg",
    latitude: `43°28'10.9"N`,
    longitude: `80°33'14.7"W}`,
    xCoordinate: 0.05272727272727273,
    yCoordinate: 0.316,
  },
];

async function runUploader() {
  console.log("RUNNING UPLOADER");

  DATA.forEach(async (data) => {
    console.log(data);
    var loc = new Location({
      name: data.name,
      building: data.building,
      latitude: data.latitude,
      longitude: data.longitude,
      xCoordinate: data.xCoordinate,
      yCoordinate: data.yCoordinate,
      image: {
        data: fs.readFileSync(`photos/${data.image}`),
        contentType: "image/jpeg",
      },
    });

    await loc.save();
    console.log("Saved", data.name);
  });
}

runUploader();
