const mongoose = require("mongoose");

const launchSchema = new mongoose.Schema({
  flightNumber: {
    type: Number,
    required: [true, "Please provide a flightNumber"],
    default: 100,
    min: 100,
    max: 999,
  },
  launchDate: {
    type: Date,
    required: [true, "Please provide a launchDate"],
  },
  mission: {
    type: String,
    required: [true, "Please provide a mission"],
  },
  rocket: {
    type: String,
    required: [true, "Please provide a rocket"],
  },
  target: {
    type: String,
    required: true,
  },
  customers: [String],
  upcoming: {
    type: Boolean,
    required: true,
    default: true,
  },
  success: {
    type: Boolean,
    required: true,
    default: true,
  },
});

const Launch = mongoose.model("Launch", launchSchema);

module.exports = Launch;
