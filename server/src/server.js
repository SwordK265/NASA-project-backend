const http = require("http");
const mongoose = require("mongoose");

const dotenv = require("dotenv");
const app = require("../src/app");

const { loadPlanetsData } = require("../src/controllers/planetsController");
const { loadLaunchData } = require("../src/controllers/launchesController");

dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASES.replace(
  "<PASSWORD>",
  process.env.DATABASES_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB connection successfully"));

const port = process.env.PORT || 8000;
const server = http.createServer(app);

const startServer = async () => {
  await loadPlanetsData();
  await loadLaunchData();

  server.listen(port, () => {
    console.log(`App running on port ${port}...`);
  });
};

startServer();
