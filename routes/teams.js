/**
 * A "Team" is just a roster with the starters and players arrays removed
 */
const Team = require('../models/roster');

const fields = 'settings metadata league_id owner_id roster_id';

module.exports = (app) => {
  /**
  * @swagger
  *
  * /teams:
  *   get:
  *     summary: "Get all Chumbo teams"
  *     tags:
  *       - team
  *     produces:
  *       - "application/json"
  *     responses:
  *       "200":
  *         description: "Returns every chumbo team (team)"
  *         content:
  *           application/json
  */
 app.get('/api/teams', async (req, res, next) => {
  Team.find({}, fields, (err, teams) => {
    if (err) {
      res.status(400).json({
        status: 'error',
        message: err,
      });
    }

    res.status(200).json(teams);
  });
});

  /**
  * @swagger
  *
  * /league/{league_id}/teams:
  *   get:
  *     summary: "Get Chumbo teams for a league season"
  *     tags:
  *       - league
  *       - team
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
  *         description: "Returns all teams for a season"
  *         content:
  *           application/json
  */
  app.get('/api/league/:league_id/teams', async (req, res, next) => {
    Team.find({
      league_id: req.params.league_id,
    }, fields, (err, teams) => {
      if (err) {
        res.status(400).json({
          status: 'error',
          message: err,
        });
      }

      res.status(200).json(teams);
    });
  });


  /**
  * @swagger
  *
  * /league/{league_id}/team/{roster_id}:
  *   get:
  *     summary: "Get information for a specific team in a season"
  *     tags:
  *       - league
  *       - team
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
  *         description: "Returns team object for given team."
  *         content:
  *           application/json
  */
  app.get('/api/league/:league_id/team/:roster_id', async (req, res, next) => {
    Team.findOne({
      league_id: req.params.league_id,
      roster_id: req.params.roster_id,
    }, fields, (err, team) => {
      if (err) {
        res.status(400).json({
          status: 'error',
          message: err,
        }); 
      }

      res.status(200).json(team);
    });
  });

  /**
  * @swagger
  *
  * /owner/{owner_id}/teams:
  *   get:
  *     summary: "Get chumbo teams for a specific user"
  *     tags:
  *       - team
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
  *         description: "Returns teams for given user."
  *         content:
  *           application/json
  */
  app.get('/api/owner/:owner_id/teams', async (req, res, next) => {
    Team.find({
      owner_id: req.params.owner_id,
    }, fields, (err, team) => {
      if (err) {
        res.status(400).json({
          status: 'error',
          message: err,
        }); 
      }

      res.status(200).json(team);
    });
  });

}
