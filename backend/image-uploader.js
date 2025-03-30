const fs = require("fs");
const Location = require("./Location");
const { uri } = require("./app.js");
const mongoose = require("mongoose");
require("dotenv").config();

mongoose.connect(uri);

const DATA = [
  {name: "outsy", building: "OUT - Outdoor", image: "IMG_1360.jpg", latitude: `43°28'15.8"N`, longitude: `80°32'42.1"W`},
  {name: "outsy2", building: "OUT - Outdoor", image: "IMG_1361.jpg", latitude: `43°28'12.2"N`, longitude: `80°32'48.5"W`},
  {name: "outsy3", building: "OUT - Outdoor", image: "IMG_1365.jpg", latitude: `43°28'10.9"N`, longitude: `80°33'14.7"W}`},
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
