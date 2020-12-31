const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  user_id: {
    type: String,
    index: true,
  },
  display_name: String,
  league_id: {
    type: String,
    index: true,
  },
  metadata: {
    avatar: {
      type: String,
      required: false,
    },
    team_name: String,
  },
});

const User = module.exports = mongoose.model('users', userSchema);
