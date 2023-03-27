const express = require("express");
const planetsRoutes = require("./planetsRoutes");
const launchesRoutes = require("./launchesRoutes");

const api = express.Router();

api.use("/planets", planetsRoutes);
api.use("/launches", launchesRoutes);

module.exports = api;
