const axios = require("axios");
const Launch = require("../models/launchesMongo");
const Planet = require("../models/planetsMongo");
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");

//getDataLaunch from api outside
async function populatedLaunches() {
  try {
    const response = await axios.post(process.env.SPACEX_REST_API, {
      query: {},
      options: {
        pagination: false,
        populate: [
          {
            path: "rocket",
            select: {
              name: 1,
            },
          },
          {
            path: "payloads",
            select: {
              customers: 1,
            },
          },
        ],
      },
    });

    if (response.status !== 200) {
      console.log("Problem downloading launch data");
      throw new AppError("Launch data download failed", 400);
    }

    const launchDocs = response.data.docs;

    for (const launchDoc of launchDocs) {
      const customers = launchDoc["payloads"].flatMap(
        (payload) => payload["customers"]
      );

      const launch = {
        flightNumber: launchDoc["flight_number"],
        mission: launchDoc["name"],
        rocket: launchDoc["rocket"]["name"],
        launchDate: launchDoc["date_local"],
        upcoming: launchDoc["upcoming"],
        success: launchDoc["success"],
        customers,
      };

      await saveLaunch(launch);
    }
  } catch (err) {
    console.log(err);
  }
}

// Nhằm mục đích get data from api 1 lần duy nhất khi data đã tồn tại trong databases rồi
// Tránh load lại data làm chậm server speed load
exports.loadLaunchData = async () => {
  const firstLaunch = await Launch.findOne({
    flightNumber: 1,
    rocket: "Falcon 1",
    mission: "FalconSat",
  });

  if (firstLaunch) {
    console.log("Launch data already loaded");
  } else {
    populatedLaunches();
  }
};

//SaveLaunch
async function saveLaunch(launch) {
  await Launch.findOneAndUpdate(
    {
      flightNumber: launch.flightNumber,
    },
    launch,
    {
      upsert: true,
    }
  );
}

//getLastestLaunch
async function getLastesLaunch() {
  const lastesLaunch = await Launch.findOne().sort("-flightNumber");
  if (!lastesLaunch) {
    return process.env.DEFAULT_LASTEST_LAUNCH;
  }

  return lastesLaunch.flightNumber;
}

exports.checkPlanetExists = async (req, res, next) => {
  const launch = req.body;

  //Kiểm tra planet có tồn tại trong databases ko
  const planet = await Planet.findOne({
    keplerName: launch.target,
  });

  if (!planet) {
    return next(
      new AppError(
        "This planet doesn not exists.Please choose the correct planet!",
        404
      )
    );
  }
  next();
};

exports.getAllLaunches = async (req, res, next) => {
  const features = new APIFeatures(Launch.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const launches = await features.query;
  res.status(200).json(launches);
};

exports.createLaunch = async (req, res, next) => {
  try {
    const launch = req.body;

    launch.launchDate = new Date(launch.launchDate);
    if (isNaN(launch.launchDate)) {
      return next(new AppError("Invalid launch date"), 400);
    }

    const lastestFlightNum = (await getLastesLaunch()) + 1;
    const newLaunch = Object.assign(launch, {
      flightNumber: lastestFlightNum,
      customers: ["ZTM", "NASA"],
      upcoming: true,
      success: true,
    });
    await saveLaunch(newLaunch);

    res.status(201).json(launch);
  } catch (err) {
    console.log(err);
    next(err);
  }
};

exports.deleteLaunch = async (req, res, next) => {
  const id = req.params.id * 1; // convert String to numb

  const aborted = await Launch.findOneAndUpdate(
    {
      flightNumber: id,
    },
    {
      upcoming: false,
      success: false,
    }
  );
  res.status(200).json(aborted);
};
