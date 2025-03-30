const fs = require("fs");
const mongoose = require("mongoose");
const Location = require("./Location");
require("dotenv").config();

// Use this variable to control whether to run the uploader or not
// Set it to true if you want to run the uploader
// and upload the data to the database
// Set it to false if you want to skip the uploader
// and just run the server
const RUN = false;
const DATA = [
  { name: "Mumbai", description: "City of Dreams", image: "photos/1.jpg" },
];

async function runUploader() {
  if (!RUN) {
    console.log("UPLOADER DISABLED");
    return;
  }

  console.log("RUNNING UPLOADER");

  DATA.forEach(async (data) => {
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

exports.runUploader = runUploader;
