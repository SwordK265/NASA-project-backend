const mongoose = require("mongoose");

const planetModel = new mongoose.Schema({
  keplerName: {
    type: String,
    required: true,
  },
});

const Planet = mongoose.model("Planet", planetModel);

module.exports = Planet;
