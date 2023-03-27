const { parse } = require("csv-parse");
const fs = require("fs");
const Planet = require("../models/planetsMongo");

function isHabitalbePlanets(planet) {
  return (
    planet["koi_disposition"] === "CONFIRMED" &&
    planet["koi_insol"] > 0.36 &&
    planet["koi_insol"] < 1.11 &&
    planet["koi_prad"] < 1.6
  );
}

async function savePlanet(data) {
  //UpdateOne() khi upsert = true thì sẽ chỉ update lại khi dữ liệu chưa tồn tại
  await Planet.updateOne(
    {
      keplerName: data.kepler_name,
    },
    {
      keplerName: data.kepler_name,
    },
    {
      upsert: true,
    }
  );
}

exports.loadPlanetsData = () => {
  return new Promise((resolve, reject) => {
    fs.createReadStream(`${__dirname}/../../data/kepler_data.csv`)
      .pipe(
        parse({
          comment: "#",
          columns: true,
        })
      )
      .on("data", async (data) => {
        if (isHabitalbePlanets(data)) {
          savePlanet(data);
        }
      })
      .on("error", (err) => {
        console.log(err);
        reject(err);
      })
      .on("end", async () => {
        const numPlanet = (await Planet.find()).length;
        console.log(`${numPlanet} planets found...`);
        resolve();
      });
  });
};

exports.getAllPlanets = async (req, res, next) => {
  const planets = await Planet.find();

  res.status(200).json(planets);
};
