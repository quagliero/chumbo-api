const mongoose = require('mongoose');

const playerSchema = mongoose.Schema({
  player_id: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  active: {
    type: Boolean,
    required: true,
  },
  fantasy_positions: {
    type: Array,
    required: false,
  },
  team: {
    type: String,
    required: false,
  },
  search_full_name: {
    type: String,
    required: false,
  },
  position: {
    type: String,
    required: false,
  },
  height: {
    type: String,
    required: false,
  },
  weight: {
    type: String,
    required: false,
  },
  first_name: {
    type: String,
    required: false,
  },
  last_name: {
    type: String,
    required: false,
  },
  full_name: {
    type: String,
    required: false,
  },
  years_exp: {
    type: Number,
    required: false,
  },
  college: {
    type: String,
    required: false,
  }
});

const Player = module.exports = mongoose.model('players', playerSchema);
