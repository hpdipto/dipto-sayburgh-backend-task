const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");

const PORT = 5000;
const DB_URI = "mongodb://localhost/dipto-sayburg-backend-test";

const app = express();

mongoose
    .connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log(`MongoDB connected successfully!`))
    .catch((e) => console.log(e));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(morgan("dev"));

app.listen(PORT, () => console.log(`🚀 Server started at port: ${PORT}`));
