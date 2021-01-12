const League = require('../models/league');

module.exports = (app) => {
  /**
  * @swagger
  *
  * /leagues:
  *   get:
  *     summary: "Get all Chumbo seasons"
  *     tags:
  *       - league
  *     parameters:
  *       - in: query
  *         name: league_id
  *         schema:
  *           type: string
  *         description: Comma delimited list of league_ids
  *       - in: query
  *         name: season
  *         schema:
  *           type: string
  *         description: Get the league(s) for the given season(s)
  *     produces:
  *       - "application/json"
  *     responses:
  *       "200":
  *         description: "Returns individual league or array of leagues"
  *         content:
  *           application/json
  */
  app.get('/api/leagues', async (req, res, next) => {
    const query = {};
    if (req.query.league_id) {
      query.league_id = {
        $in: req.query.league_id.split(','),
      };
    }

    if (req.query.season) {
      query.season = {
        $in: req.query.season.split(','),
      };
    }

    League.find(query, (err, leagues) => {
      if (err) {
        res.status(400).json({
          status: 'error',
          message: err,
        });
      }

      res.status(200).json(leagues);
    }).limit(100);
  });

  /**
  * @swagger
  *
  * /league/{league_id}:
  *   get:
  *     summary: "Get single chumbo season"
  *     tags:
  *       - league
  *     parameters:
  *       - in: path
  *         name: league_id
  *         schema:
  *           type: string
  *           example: chumbo_2012
  *     produces:
  *       - "application/json"
  *     responses:
  *       "200":
  *         description: "Returns league object."
  *         content:
  *           application/json
  */
  app.get('/api/league/:league_id', async (req, res, next) => {
    League.findOne({ league_id: req.params.league_id }, (err, league) => {
      if (err) {
        res.status(400).json({
          status: 'error',
          message: err,
        }); 
      }

      res.status(200).json(league);
    });
  });
}
