module.exports = (app) => {
  app.get('/', async (req, res, next) => {
    res.send('Welcome to the Chumbo API: <a href="/api/docs">docs</a> | <a href="/api/healthcheck">healthcheck</a>.');
  });
}
