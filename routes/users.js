const User = require('../models/user');

module.exports = (app) => {
  /**
  * @swagger
  *
  * /league/{league_id}/owners:
  *   get:
  *     summary: "Get Chumbo users for a league season"
  *     tags:
  *       - league
  *       - owner
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
  *         description: "Returns all users for a season"
  *         content:
  *           application/json
  */
  app.get('/league/:league_id/owners', async (req, res, next) => {
    User.find({
      league_id: req.params.league_id,
    }, (err, users) => {
      if (err) {
        res.status(400).json({
          status: 'error',
          message: err,
        });
      }

      res.status(200).json(users);
    });
  });


  /**
  * @swagger
  *
  * /league/{league_id}/owner/{owner_id}:
  *   get:
  *     summary: "Get chumbo user for a specific season"
  *     tags:
  *       - league
  *       - owner
  *     parameters:
  *       - in: path
  *         name: league_id
  *         schema:
  *           type: string
  *           example: chumbo_2012
  *       - in: path
  *         name: owner_id
  *         schema:
  *           type: string
  *           example: chumbolegacy_jimmie
  *     produces:
  *       - "application/json"
  *     responses:
  *       "200":
  *         description: "Returns owner object for given user."
  *         content:
  *           application/json
  */
  app.get('/league/:league_id/owner/:owner_id', async (req, res, next) => {
    User.findOne({
      league_id: req.params.league_id,
      user_id: req.params.owner_id,
    }, (err, user) => {
      if (err) {
        res.status(400).json({
          status: 'error',
          message: err,
        }); 
      }

      res.status(200).json(user);
    });
  });

  /**
  * @swagger
  *
  * /user/{user_id}:
  *   get:
  *     summary: "Get all chumbo seasons for a given user"
  *     tags:
  *       - user
  *     parameters:
  *       - in: path
  *         name: user_id
  *         schema:
  *           type: string
  *           example: chumbolegacy_euan
  *         description: The owner/user ID
  *     produces:
  *       - "application/json"
  *     responses:
  *       "200":
  *         description: "Returns users for given user."
  *         content:
  *           application/json
  */
  app.get('/user/:user_id', async (req, res, next) => {
    User.find({
      user_id: req.params.user_id,
    }, (err, user) => {
      if (err) {
        res.status(400).json({
          status: 'error',
          message: err,
        }); 
      }

      res.status(200).json(user);
    });
  });

}
