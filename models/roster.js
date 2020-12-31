const mongoose = require('mongoose');

const rosterSchema = mongoose.Schema({
  league_id: {
    type: String,
    required: true,
    index: true,
  },
  owner_id: {
    type: String,
    required: true,
    index: true,
  },
  roster_id: Number,
  settings: {
    wins: Number,
    losses: Number,
    ties: Number,
    fpts: Number,
    fpts_decimal: Number,
    fpts_against: Number,
    fpts_against_decimal: Number,
    total_moves: Number,
  },
  players: [String],
  metadata: {
    record: String,
  },
  starters: [String],
});

const Roster = module.exports = mongoose.model('rosters', rosterSchema);
