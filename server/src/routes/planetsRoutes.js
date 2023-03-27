const express = require("express");
const planetsController = require("../controllers/planetsController");

const router = express.Router();

router.get("/", planetsController.getAllPlanets);

module.exports = router;
