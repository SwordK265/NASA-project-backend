const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const api = require("../src/routes/api");
const globalHandleError = require("../src/controllers/errorController");

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);
app.use(morgan("combined"));
app.use(express.json());
// app.use(express.static()) dùng để đọc file public khi chạy production (deploy)

//Tạo ra để kiểm soát version
app.use("/v1", api);

app.use(globalHandleError);

module.exports = app;
