module.exports = (app) => {
  app.get('/', async (req, res, next) => {
    res.redirect(301, '/docs');
  });
}
