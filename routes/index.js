module.exports = (app) => {
  app.get('/', async (req, res, next) => {
    res.send('Welcome to the Chumbo API: <a href="/docs">docs</a> | <a href="/healthcheck">healthcheck</a>.');
  });
}
