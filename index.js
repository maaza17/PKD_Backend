const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const vendor = require("./routes/api/vendor")

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

mongoose
  .connect(
    "mongodb+srv://" +
      process.env.DB_USER +
      ":" +
      process.env.DB_PASS +
      "@fyp.tkd8x.mongodb.net/" +
      process.env.DB_NAME +
      "?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Database connected successfully"))
  .catch((err) => console.log(err));

app.use("/api/vendor", vendor);

const port = process.env.PORT || 7000;

app.listen(port,  () => {
console.log('Server running on port ' + port)
})