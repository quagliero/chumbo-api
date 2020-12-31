const Player = require('../models/player');

module.exports = (app) => {
  /**
  * @swagger
  *
  * /players:
  *   get:
  *     summary: "Get NFL players"
  *     tags:
  *       - players
  *     parameters:
  *       - in: query
  *         name: player_id
  *         schema:
  *           type: string
  *         description: Comma delimited list of player_ids
  *       - in: query
  *         name: position
  *         schema:
  *           type: string
  *           example: 50
  *         description: Comma delimited list of player positions
  *       - in: query
  *         name: limit
  *         schema:
  *           type: string
  *         description: Limit response to this many players
  *     produces:
  *       - "application/json"
  *     responses:
  *       "200":
  *         description: "Returns array of players"
  *         content:
  *           application/json
  */
  app.get('/players', async (req, res, next) => {
    const query = {};
    if (req.query.player_id) {
      query.player_id = {
        $in: req.query.player_id.split(','),
      };
    }

    if (req.query.position) {
      query.position = {
        $in: req.query.position.split(','),
      };
    }

    Player.find(query, (err, players) => {
      if (err) {
        res.status(400).json({
          status: 'error',
          message: err,
        });
      }

      res.status(200).json(players);
    }).limit(100);
  });

  /**
  * @swagger
  *
  * /players/{player_id}:
  *   get:
  *     summary: "Get NFL player by player_id"
  *     tags:
  *       - players
  *     parameters:
  *       - in: path
  *         name: player_id
  *         schema:
  *           type: string
  *           example: 1387
  *     produces:
  *       - "application/json"
  *     responses:
  *       "200":
  *         description: "Returns player object."
  *         content:
  *           application/json
  */
  app.get('/players/:player_id', async (req, res, next) => {
    Player.findOne({ player_id: req.params.player_id }, (err, player) => {
      if (err) {
        res.status(400).json({
          status: 'error',
          message: err,
        }); 
      }

      res.status(200).json(player);
    });
  });
}
