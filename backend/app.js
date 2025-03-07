const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors());

app.get("/", (req, res) => {
  res.send({ Done: "There" });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, console.log(`Server started on port ${PORT}`));
