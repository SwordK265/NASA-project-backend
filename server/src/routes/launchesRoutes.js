const express = require("express");
const launchesController = require("../controllers/launchesController");

const router = express.Router();

router
  .route("/")
  .get(launchesController.getAllLaunches)
  .post(launchesController.checkPlanetExists, launchesController.createLaunch);

router.route("/:id").delete(launchesController.deleteLaunch);

module.exports = router;
