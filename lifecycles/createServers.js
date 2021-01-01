const mongoose = require('mongoose');

/**
* Connect to mongodb via mongoose
*
* @param {Gasket} gasket Gasket API.
* @param {Object} serverOpts Server options.
* @returns {Express} The web server.
* @public
*/
module.exports = async function createServers(gasket, serverOpts) {
  // set things unique for the local command
  const isLocal = gasket.command.id === 'local';

  const port = isLocal ? 8080 : 3000;
  const customOpts = {
    http: {
      ...serverOpts.http,
      port,
    },
  }

  // connect to mongo db
  mongoose.connect('mongodb://localhost/chumbo', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  }, (err) => {
    if (err) throw err;
    console.log('MongoDB database connection established successfully');
  });

  mongoose.connection.on('error', (err) => {
    console.error(err);
  });

  return {
    ...serverOpts,
    ...customOpts,
  };
}
