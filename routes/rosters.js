const Roster = require('../models/roster');

module.exports = (app) => {
  /**
  * @swagger
  *
  * /league/{league_id}/rosters:
  *   get:
  *     summary: "Get Chumbo rosters for a league season"
  *     tags:
  *       - league
  *       - roster
  *     parameters:
  *       - in: path
  *         name: league_id
  *         schema:
  *           type: string
  *           example: chumbo_2012
  *         description: League ID
  *     produces:
  *       - "application/json"
  *     responses:
  *       "200":
  *         description: "Returns all rosters for a season"
  *         content:
  *           application/json
  */
  app.get('/league/:league_id/rosters', async (req, res, next) => {
    Roster.find({
      league_id: req.params.league_id,
    }, (err, rosters) => {
      if (err) {
        res.status(400).json({
          status: 'error',
          message: err,
        });
      }

      res.status(200).json(rosters);
    });
  });


  /**
  * @swagger
  *
  * /league/{league_id}/roster/{roster_id}:
  *   get:
  *     summary: "Get chumbo roster for a specific team"
  *     tags:
  *       - league
  *       - roster
  *     parameters:
  *       - in: path
  *         name: league_id
  *         schema:
  *           type: string
  *           example: chumbo_2012
  *       - in: path
  *         name: roster_id
  *         schema:
  *           type: string
  *           example: 1
  *     produces:
  *       - "application/json"
  *     responses:
  *       "200":
  *         description: "Returns roster object for given roster."
  *         content:
  *           application/json
  */
  app.get('/league/:league_id/roster/:roster_id', async (req, res, next) => {
    Roster.findOne({
      league_id: req.params.league_id,
      roster_id: req.params.roster_id,
    }, (err, roster) => {
      if (err) {
        res.status(400).json({
          status: 'error',
          message: err,
        }); 
      }

      res.status(200).json(roster);
    });
  });

  /**
  * @swagger
  *
  * /owner/{owner_id}/rosters:
  *   get:
  *     summary: "Get chumbo rosters for a specific user"
  *     tags:
  *       - roster
  *       - owner
  *     parameters:
  *       - in: path
  *         name: owner_id
  *         schema:
  *           type: string
  *           example: chumbolegacy_euan
  *         description: The owner/user ID
  *     produces:
  *       - "application/json"
  *     responses:
  *       "200":
  *         description: "Returns rosters for given user."
  *         content:
  *           application/json
  */
  app.get('/owner/:owner_id/rosters', async (req, res, next) => {
    Roster.find({
      owner_id: req.params.owner_id,
    }, (err, roster) => {
      if (err) {
        res.status(400).json({
          status: 'error',
          message: err,
        }); 
      }

      res.status(200).json(roster);
    });
  });

}
