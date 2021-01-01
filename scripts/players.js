const fetch = require('node-fetch');
const fs = require('fs');
const mongoose = require('mongoose');
const Player = require('../models/player');

mongoose.connect('mongodb://localhost/chumbo', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

const getPlayers = async function () {
  return await fetch('https://api.sleeper.app/v1/players/nfl')
  .then(res => res.json())
  .then(players => {
    const newPlayers = Object.entries(players).map(([ key, val ]) => {
      return val;
    }).filter((p) => ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'].includes(p.position));

    return newPlayers;
  });
};

(async function () {
  try {
    const x = await Player.deleteMany({}).exec();
    console.log(x);
  } catch (err) {
    err.stack;
  }

  const players = await getPlayers();

  Player.insertMany(players, (err, doc) => {
    if (err) throw err;
    console.log(`${doc.length} players added to db`);
    fs.writeFileSync('./data/players.json', JSON.stringify(players), 'utf-8');
    process.exit();
  });

})();
