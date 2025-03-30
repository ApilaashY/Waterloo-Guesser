const fs = require("fs");
const Location = require("./Location");
const { uri } = require("./app.js");
const mongoose = require("mongoose");
require("dotenv").config();

mongoose.connect(uri);

// Use this variable to control whether to run the uploader or not
// Set it to true if you want to run the uploader
// and upload the data to the database
// Set it to false if you want to skip the uploader
// and just run the server
const DATA = [
  { name: "Mumbai", description: "City of Dreams", image: "photos/2.jpg" },
  { name: "Mumbai", description: "City of Dreams", image: "photos/3.jpg" },
];

async function runUploader() {
  console.log("RUNNING UPLOADER");

  DATA.forEach(async (data) => {
    console.log(data);
    var loc = new Location({
      name: data.name,
      description: data.description,
      image: {
        data: fs.readFileSync(data.image),
        contentType: "image/jpeg",
      },
    });

    await loc.save();
  });
  console.log("Location saved");
}

runUploader();
