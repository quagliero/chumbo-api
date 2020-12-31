const mongoose = require('mongoose');
const User = require('../models/user');

mongoose.connect('mongodb://localhost/chumbo', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

const year = process.argv[2] || 'all';

const getJson = (year) => {
  const jsonArr = [];
  const years = year === 'all' ? [2012,2013,2014,2015,2016,2017,2018,2019,2020] : [year];

  years.forEach((y) => {
    const z = require(`../data/${y}/users.json`);
    jsonArr.push(z);
  });

  return jsonArr;
};

(async function () {
  const userJson = getJson(year).flat();

  try {
    const x = await User.deleteMany({}).exec();
    console.log(x);
  } catch (err) {
    err.stack;
  }

  User.insertMany(userJson, (err, doc) => {
    if (err) throw err;
    console.log(`${doc.length} users added to db`);
    process.exit();
  });
})();
