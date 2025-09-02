/**
 * This monolithic hack file takes scraped data that the `index.js`
 * script writes and turns it into sleeper friendly JSON
 *
 * TODO:
 *  - transactions
 */

const league = require("../data/2012/league.json");
const playerData = require("../data/players.json");
const managers = require("./managers.json");
const { printTable, Table } = require("console-table-printer");

const { writeFileSync } = require("fs");

const playerKeys = Object.keys(playerData);

const getOwnerByRosterId = (year, rosterId) => {
  const rosters = require(`../data/${year}/rosters.json`);

  return rosters.find((x) => x.roster_id === rosterId);
};

const getUserByOwnerId = (year, ownerId) => {
  const users = require(`../data/${year}/users.json`);

  return users.find((x) => x.user_id === ownerId);
};

const getUserByRosterId = (year, rosterId) =>
  getUserByOwnerId(year, getOwnerByRosterId(year, rosterId)?.owner_id);

const getRosterByOwnerId = (year, ownerId) => {
  const rosters = require(`../data/${year}/rosters.json`);
  let owner = rosters.find((x) => x.owner_id === ownerId);

  // check for co_owner
  if (!owner) {
    owner = rosters.find((x) => x.metadata?.co_owner?.owner_id === ownerId);
  }

  return owner;
};

const getPlayerDetails = (p, pos) => {
  if (playerData[p]) {
    return playerData[p];
  }

  const attemptedMatch = playerKeys.find((k) => {
    if (playerData[k].full_name === p && playerData[k].position === pos) {
      return true;
    }
    console.log(p);

    if (playerData[k].full_name === p) {
      return true;
    }

    return false;
  });

  if (playerData[attemptedMatch]?.length === 1) {
    return playerData[attemptedMatch];
  }

  return {
    full_name: p,
    position: pos,
  };
};

const getPlayerId = (name, position) => {
  let matchType = [];
  const attemptedMatch = playerKeys.filter((k) => {
    // only check positions we use
    const player = playerData[k];
    if (!league.roster_positions.includes(player.position)) {
      return false;
    }

    // Full(-ish) name and position match
    if (player.position === position) {
      if (player.full_name === name) {
        matchType.push("name and position");
        return true;
      }
      if (`${player.first_name} ${player.last_name}` === name) {
        // Handle DSTs who have first_name: City, last_name: nickname
        matchType.push("DST");
        return true;
      }
      // Handle names that contain everything, e.g. Robert Griffin III = Robert Griffin
      if (name.includes(player.full_name)) {
        matchType.push("name includes full_name");
        return true;
      }
    }

    // Partial
    if (player.full_name === name) {
      matchType.push("name only");
      return true;
    }

    return false;
  });

  if (attemptedMatch.length > 1) {
    console.warn(`Matched ${name} multiples times: ${matchType.join(", ")}`, {
      attemptedMatch,
      name,
      position,
    });
  }

  if (attemptedMatch.length === 1) {
    console.info(`Matched ${name} by ${matchType.join("")}`, {
      attemptedMatch,
    });
  }

  if (attemptedMatch.length === 0) {
    console.warn(`Couldn't match ${name} - ${position}`);
  }

  // Defer to highest ranked match
  return attemptedMatch[0] || name;
};

// USERS
const createUsersJson = (year) => {
  const users = require(`../raw_data/${year}/users.json`);

  writeFileSync(
    `./data/${year}/users.json`,
    JSON.stringify(users),
    "utf-8",
    (err) => {
      if (err) throw err;
    }
  );
  console.log(`${year} users written to ./data/${year}/users.json`);
};

// ROSTERS
const createRostersJson = (year) => {
  const roster = require(`../raw_data/${year}/rosters.json`);

  const formattedRoster = roster.map((team) => {
    const starters = [];
    const players = [];

    team.players.forEach((p) => {
      const playerId = getPlayerId(p.name, p.position);
      if (p.starter) {
        starters.push(playerId);
      }
      players.push(playerId);
    });

    return Object.assign(team, {
      players,
      starters,
    });
  });

  writeFileSync(
    `./data/${year}/rosters.json`,
    JSON.stringify(formattedRoster),
    "utf-8",
    (err) => {
      if (err) throw err;
    }
  );
  console.log(`${year} rosters written to ./data/${year}/rosters.json`);
};

// createRostersJson(2015);

// MATCHUPS
const createMatchupsJson = (year, weeks) =>
  // Take scraped matchup data and replace player objects with player IDs
  weeks.forEach((week) => {
    try {
      const matchups = require(`../raw_data/${year}/matchups/${week}.json`);

      const formattedMatchups = matchups.map((matchup) => {
        const starters = [];
        const players = [];
        matchup.players.forEach((m) => {
          const playerId = getPlayerId(m.name, m.position);
          if (m.starter) {
            starters.push(playerId);
          }
          players.push(playerId);
        });

        return Object.assign(matchup, {
          roster_id:
            getRosterByOwnerId(year, matchup.roster_id)?.roster_id ||
            matchup.roster_id,
          user_id: matchup.roster_id,
          starters,
          players,
        });
      });

      writeFileSync(
        `./data/${year}/matchups/${week}.json`,
        JSON.stringify(formattedMatchups),
        "utf-8",
        (err) => {
          if (err) throw err;
        }
      );
      console.info(
        `${year} week ${week} matchups written to ./data/${year}/matchups/${week}.json`
      );
    } catch (err) {
      console.error(err);
    }
  });

// PICKS
const createPicksJson = (year) => {
  const picks = require(`../raw_data/${year}/picks.json`);

  const formattedPicks = picks.map((p) => {
    const roster = getRosterByOwnerId(year, p.picked_by);
    const { round, pick_no, picked_by, draft_slot } = p;

    return {
      round,
      pick_no,
      picked_by,
      draft_slot,
      player_id: getPlayerId(p.name, p.position),
      roster_id: roster.roster_id,
    };
  });

  writeFileSync(
    `./data/${year}/picks.json`,
    JSON.stringify(formattedPicks),
    "utf-8",
    (err) => {
      if (err) throw err;
    }
  );
  console.log(`${year} draft picks written to ./data/${year}/picks.json`);
};

// createPicksJson(2012);

// BRACKETS
const createBracketsJson = (year, type = "championship") => {
  const fileName =
    type === "consolation" ? "losers_bracket" : "winners_bracket";
  const bracket = require(`../raw_data/${year}/${fileName}.json`);

  const formattedBracket = bracket.map((b) => {
    const x = {
      r: b.round,
      m: b.matchup,
      w: getRosterByOwnerId(year, b.winner).roster_id,
      l: getRosterByOwnerId(year, b.loser).roster_id,
      t1: getRosterByOwnerId(year, b.team_1).roster_id,
      t2: getRosterByOwnerId(year, b.team_2).roster_id,
      p: b.p,
      t1_from: b.t1_from,
      t2_from: b.t2_from,
    };

    return x;
  });

  writeFileSync(
    `./data/${year}/${fileName}.json`,
    JSON.stringify(formattedBracket),
    "utf-8",
    (err) => {
      if (err) throw err;
    }
  );
  console.log(
    `${year} ${type} bracket written to ./data/${year}/${fileName}.json`
  );
};

// createBracketsJson(2013);
// createBracketsJson(2013, 'consolation');

// LEAGUE
const createLeagueJson = (year) => {
  const league = require(`../raw_data/${year}/league.json`);
  const formattedLeague = {
    status: "post_season",
    sport: "nfl",
    season_type: "regular",
    season: league.season,
    name: league.name,
    draft_id: `chumbo_draft_${year}`,
    league_id: `chumbo_${year}`,
    previous_league_id: year > 2012 ? `chumbo_${year - 1}` : null,
    bracket_id: `chumbo_winners_bracket_${year}`,
    loser_bracket_id: `chumbo_losers_bracket_${year}`,
    settings: {
      playoff_type: 1,
      daily_waivers: 0,
      playoff_seed_type: 0,
      start_week: 1,
    },
  };

  Object.entries(league.settings).forEach(([key, val]) => {
    if (key === "Divisions") {
      formattedLeague.settings.divisions = parseInt(val) || 0;
    } else if (key === "Playoffs") {
      formattedLeague.settings.playoff_teams = parseInt(val.split("- ")[1]);
    } else if (key === "Teams") {
      formattedLeague.total_rosters = Number(val);
      formattedLeague.settings.num_teams = Number(val);
    }
  });

  const positionMap = {
    "Quarterback:": "QB",
    "Running Back:": "RB",
    "Wide Receiver:": "WR",
    "Tight End:": "TE",
    "Wide Receiver / Running Back:": "FLEX",
    "Kicker:": "K",
    "Defensive Team:": "DEF",
    "Bench:": "BN",
  };
  formattedLeague.roster_positions = league.roster_positions
    .map((o) => {
      return Array(Number(o.value)).fill(positionMap[o.key]);
    })
    .flat();

  const formatScoring = (key, pointPer) => {
    let val;
    if (pointPer) {
      const [points, yards] = league.scoring_settings[key].split(" point per ");
      val = parseInt(points) / parseInt(yards);
    } else {
      val = parseInt(league.scoring_settings[key]);
    }

    if (val < 0) {
      return val;
    }

    return val || 0;
  };

  formattedLeague.scoring_settings = {
    blk_kick: formatScoring("Blocked Kicks:"),
    def_2pt: formatScoring("Team Def 2-point Return:"),
    def_kr_td: formatScoring("Kickoff and Punt Return Touchdowns:"),
    def_pr_td: formatScoring("Kickoff and Punt Return Touchdowns:"),
    def_st_ff: formatScoring("Fumbles Forced:"),
    def_st_fum_rec: formatScoring("Fumbles Recovered:"),
    def_st_td: formatScoring("Touchdowns:"),
    def_td: formatScoring("Touchdowns:"),
    ff: formatScoring("Fumbles Forced:"),
    fgm_0_19: formatScoring("FG Made 0-19:"),
    fgm_20_29: formatScoring("FG Made 20-29:"),
    fgm_30_39: formatScoring("FG Made 30-39:"),
    fgm_40_49: formatScoring("FG Made 40-49:"),
    fgm_50p: formatScoring("FG Made 50+:"),
    fgmiss_0_19: formatScoring("FG Missed 0-19:"),
    fgmiss_20_29: formatScoring("FG Missed 20-29:"),
    fgmiss: formatScoring("FG Missed:"),
    fum_lost: formatScoring("Fumbles Lost:"),
    fum_rec: formatScoring("Fumbles Recovered:"),
    fum: 0.0,
    int: formatScoring("Interceptions:"),
    pass_2pt: formatScoring("2-Point Conversions:"),
    pass_int: formatScoring("Interceptions Thrown:"),
    pass_td: formatScoring("Passing Touchdowns:"),
    pass_yd: formatScoring("Passing Yards:", true),
    pts_allow_0: formatScoring("Points Allowed 0:"),
    pts_allow_1_6: formatScoring("Points Allowed 1-6:"),
    pts_allow_14_20: formatScoring("Points Allowed 14-20:"),
    pts_allow_21_27: formatScoring("Points Allowed 21-27:"),
    pts_allow_28_34: formatScoring("Points Allowed 28-34:"),
    pts_allow_35p: formatScoring("Points Allowed 35+:"),
    pts_allow_7_13: formatScoring("Points Allowed 7-13:"),
    rec_2pt: formatScoring("2-Point Conversions:"),
    rec_td: formatScoring("Receiving Touchdowns:"),
    rec_yd: formatScoring("Receiving Yards:", true),
    rec: formatScoring("Receptions:"),
    rush_2pt: formatScoring("2-Point Conversions:"),
    rush_td: formatScoring("Rushing Touchdowns:"),
    rush_yd: formatScoring("Rushing Yards:", true),
    sack: formatScoring("Sacks:"),
    safe: formatScoring("Safeties:"),
    st_ff: formatScoring("Fumbles Forced:"),
    st_fum_rec: formatScoring("Fumbles Recovered:"),
    st_td: formatScoring("Touchdowns:"),
    xpm: formatScoring("PAT Made:"),
    xpmiss: formatScoring("PAT Missed:"),
  };

  writeFileSync(
    `./data/${year}/league.json`,
    JSON.stringify(formattedLeague),
    "utf-8",
    (err) => {
      if (err) throw err;
    }
  );

  console.log(`${year} league data written to ./data/${year}/league.json`);
};

// createLeagueJson(2018);

// DRAFT
const createDraftJson = (year) => {
  const draft = require(`../raw_data/${year}/draft.json`);
  let draft_order = {};
  let slots_to_roster_id = {};

  draft.draft_order.forEach((id, i) => {
    try {
      const roster = getRosterByOwnerId(year, id);
      draft_order[id] = i + 1;
      slots_to_roster_id[i + 1] = roster.roster_id;
    } catch (err) {
      console.log(year, id);
    }
  });

  const formattedDraft = {
    type: "snake",
    status: "complete",
    start_time: new Date(`01/09/${year}`).getTime(),
    sport: "nfl",
    season_type: "regular",
    season: String(year),
    metadata: {
      scoring_type: "std",
      name: `${year} Chumbo Draft`,
    },
    league_id: `chumbo_${year}`,
    settings: {
      teams: draft.draft_order.length,
      rounds: 15,
      slots_wr: 2,
      slots_te: 1,
      slots_rb: 2,
      slots_qb: 1,
      slots_k: 1,
      slots_flex: 1,
      slots_def: 1,
      slots_bn: 6,
      reversal_round: 0,
    },
    draft_order,
    slots_to_roster_id,
  };

  writeFileSync(
    `./data/${year}/draft.json`,
    JSON.stringify(formattedDraft),
    "utf-8",
    (err) => {
      if (err) throw err;
    }
  );
  console.log(`${year} draft info written to ./data/${year}/draft.json`);
};

// createDraftJson(2012);

// CREATE ALL DATA
const createJsonForYear = (year) => {
  createLeagueJson(year);
  createUsersJson(year);
  createRostersJson(year);
  // createDraftJson(year);
  // createPicksJson(year);
  createBracketsJson(year);
  createBracketsJson(year, "consolation");
  createMatchupsJson(
    [year],
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
  );
};

// [2012,2013,2014,2015,2016,2017,2018,2019].forEach((y) => {
//   createRostersJson(y)
// })
// createJsonForYear(2019);

// const x = require('./data/2015/matchups/12.json');

// x.forEach((m) => {
//   console.log(m);
// })

// LOGGING PLAYGROUND

const formatNumber = (whole = 0, decimal = 0) => whole + decimal / 100;

const logRecords = (years, tiers = false) => {
  let table = [];
  years.forEach((year) => {
    const y = require(`../data/${year}/rosters.json`);

    y.forEach((m) => {
      let team = table.find((z) => z.owner_id === m.owner_id);
      const manager = managers.find((x) => x.sleeper.id === m.owner_id);

      if (team) {
        team.wins += m.settings.wins;
        team.losses += m.settings.losses;
        team.ties += m.settings.ties;
        team.fpts += formatNumber(m.settings.fpts, m.settings.fpts_decimal);
        team.fpts_against += formatNumber(
          m.settings.fpts_against,
          m.settings.fpts_against_decimal
        );
      } else {
        const user = getUserByOwnerId(year, m.owner_id);
        const data = {
          // tier: null,
          owner_id: m.owner_id,
          name: user.display_name,
          wins: m.settings.wins,
          losses: m.settings.losses,
          ties: m.settings.ties,
          perc: null,
          fpts: formatNumber(m.settings.fpts, m.settings.fpts_decimal),
          fpts_avg: null,
          fpts_against: formatNumber(
            m.settings.fpts_against,
            m.settings.fpts_against_decimal
          ),
          fpts_against_avg: null,
          trophies: `${new Array(manager?.firstPlace?.length || 0)
            .fill(null)
            .map(() => "🏆")
            .join("")}${new Array(manager?.secondPlace?.length || 0)
            .fill(null)
            .map(() => "🥈")
            .join("")}${new Array(manager?.scoringCrowns || 0)
            .fill(null)
            .map(() => "🎯")
            .join("")}`,
        };

        if (y.length === 1 && m.metadata.co_owner) {
          data.name += ` (interim: ${m.metadata.co_owner.owner_id} from week ${m.metadata.co_owner.week})`;
        }

        table.push(data);
      }
    });
  });

  let sorted = table
    .map((x, i) => {
      delete x.owner_id;
      return Object.assign(x, {
        perc: (
          ((x.wins + x.ties / 2) / (x.wins + x.losses + x.ties)) *
          100
        ).toFixed(2),
        fpts: x.fpts.toFixed(2),
        fpts_avg: (x.fpts / (x.wins + x.losses + x.ties)).toFixed(2),
        fpts_against: x.fpts_against.toFixed(2),
        fpts_against_avg: (
          x.fpts_against /
          (x.wins + x.losses + x.ties)
        ).toFixed(2),
        trophies: x.trophies,
      });
    })
    // tiers by points, otherwise by win percentage
    .sort(
      tiers
        ? (a, b) => b.fpts - a.fpts
        : (a, b) => b.perc - a.perc || b.wins - a.wins || b.fpts - a.fpts
    )
    // wadlow not in the tiers
    .filter((x) => (tiers ? x.name !== "DontPanic22" : true));

  // brock last in the tiers
  // if (tiers) {
  //   const brockIdx = sorted.findIndex((x) => x.name === "brocky306");

  //   const brocky = sorted.splice(brockIdx, 1);
  //   sorted = sorted.concat(brocky);
  // }

  const t = new Table({
    title: tiers
      ? `Chumbo Points Tiers for ${years.join(", ")}`
      : "Chumbo All-Time Records",
  });
  if (tiers) {
    t.addRows(sorted.slice(0, 3), { color: "green" });
    t.addRows(sorted.slice(3, 6), { color: "blue" });
    t.addRows(sorted.slice(6, 9), { color: "yellow" });
    t.addRows(sorted.slice(9, 12), { color: "red" });
  } else {
    t.addRows(sorted);
  }
  t.printTable();
  // const tierMap = (position) => {
  //   if (position <= 3) {
  //     return 1;
  //   } else if (position <= 6) {
  //     return 2;
  //   } else if (position <= 9) {
  //     return 3;
  //   } else {
  //     return 4;
  //   }
  // };

  // function arraymove(arr, fromIndex, toIndex) {
  //   var element = arr[fromIndex];
  //   arr.splice(fromIndex, 1);
  //   arr.splice(toIndex, 0, element);
  // }

  // const scumboIndex = sorted.findIndex((x) => x.name === 'jmshelley');

  // arraymove(sorted, scumboIndex, sorted.length - 1);

  // console.log(sorted.map((x, i) => {
  //   return Object.assign(x, {
  //     tier: tierMap(i + 1),
  //   })
  // }))
};

const logWinnersBracket = (year) => {
  const winnersBracket = require(`../data/${year}/winners_bracket.json`);
  // const matchups = require(`../data/${year}/matchups/17.json`);

  winnersBracket.forEach((m) => {
    // Skip consolation games by checking the 'p' field
    if (m.p && m.p !== 1) {
      return;
    }

    // Track winner and loser for this match
    const winnerId = m.w;
    const loserId = m.l;

    // Retrieve user information
    const winnerUserId = getUserByRosterId(year, winnerId).user_id;
    const loserUserId = getUserByRosterId(year, loserId).user_id;
    const winnerUser = managers.find(
      (x) => x.sleeper.id === winnerUserId
    ).teamName;
    const loserUser = managers.find(
      (x) => x.sleeper.id === loserUserId
    ).teamName;

    const week = require(`../data/${year}/matchups/${
      (year === 2012 || year >= 2021 ? 14 : 13) + m.r
    }.json`);

    const matchupWinner = week.find((x) => x.roster_id === winnerId);
    const matchupLoser = week.find((x) => x.roster_id === loserId);

    let round;

    if (m.p === 1) {
      round = "Championship";
    } else if (year === 2012 && m.r === 1) {
      round = "Semi-Final";
    } else if (m.r === 1) {
      round = "Quarter-Final";
    } else {
      round = "Semi-Final";
    }

    console.log(
      `${round} : ${winnerUser} ${matchupWinner.points} vs ${matchupLoser.points} ${loserUser}`
    );
  });
};

function logPlayoffWinLossRecord(years) {
  // Initialize a record object to store wins, losses, and additional metrics for each user
  const winLossRecord = {};

  years.forEach((year) => {
    try {
      const playoffData = require(`../data/${year}/winners_bracket.json`);

      // Track all users who participated in playoffs this year
      const playoffParticipants = new Set();

      playoffData.forEach((match) => {
        // Skip consolation games by checking the 'p' field
        if (match.p && match.p !== 1) {
          return;
        }

        // Track winner and loser for this match
        const winnerId = match.w;
        const loserId = match.l;

        // Retrieve user information
        const winnerUserId = getUserByRosterId(year, winnerId)?.user_id;
        const loserUserId = getUserByRosterId(year, loserId)?.user_id;

        if (!winnerUserId || !loserUserId) return;

        const winnerUser = managers.find(
          (x) => x.sleeper.id === winnerUserId
        ).teamName;
        const loserUser = managers.find(
          (x) => x.sleeper.id === loserUserId
        ).teamName;

        // Initialize win-loss records and arrays if not present
        if (!winLossRecord[winnerUser]) {
          winLossRecord[winnerUser] = {
            wins: 0,
            losses: 0,
            appearances: [],
            bowlAppearances: [],
            bowlWins: [],
            bowlLosses: [],
          };
        }
        if (!winLossRecord[loserUser]) {
          winLossRecord[loserUser] = {
            wins: 0,
            losses: 0,
            appearances: [],
            bowlAppearances: [],
            bowlWins: [],
            bowlLosses: [],
          };
        }

        // Update wins and losses
        winLossRecord[winnerUser].wins += 1;
        winLossRecord[loserUser].losses += 1;

        // Add year to playoff appearances if it's their first appearance this year
        if (!winLossRecord[winnerUser].appearances.includes(year)) {
          winLossRecord[winnerUser].appearances.push(year);
        }
        if (!winLossRecord[loserUser].appearances.includes(year)) {
          winLossRecord[loserUser].appearances.push(year);
        }

        // Handle championship game (p: 1)
        if (match.p === 1) {
          // Update bowl appearances
          if (!winLossRecord[winnerUser].bowlAppearances.includes(year)) {
            winLossRecord[winnerUser].bowlAppearances.push(year);
          }
          if (!winLossRecord[loserUser].bowlAppearances.includes(year)) {
            winLossRecord[loserUser].bowlAppearances.push(year);
          }

          // Update bowl wins and losses
          winLossRecord[winnerUser].bowlWins.push(year);
          winLossRecord[loserUser].bowlLosses.push(year);
        }

        // Track all playoff participants this year (for appearances)
        playoffParticipants.add(winnerUser);
        playoffParticipants.add(loserUser);
      });

      // Ensure every participant in playoffs this year has the year recorded in their appearances
      playoffParticipants.forEach((user) => {
        if (!winLossRecord[user].appearances.includes(year)) {
          winLossRecord[user].appearances.push(year);
        }
      });
    } catch (e) {
      console.log(`Error processing year ${year}:`, e);
    }
  });

  const t = new Table({ title: "Playoff Records" });

  const tableData = Object.entries(winLossRecord)
    .map(([user, record]) => {
      return {
        user,
        wins: record.wins,
        losses: record.losses,
        winPerc: (record.wins / (record.wins + record.losses)).toFixed(2),
        appearances: record.appearances.length,
        finals: record.bowlAppearances.length,
        result: `${record.bowlWins.map(() => `🏆`).join("")} ${record.bowlLosses
          .map(() => `🥈`)
          .join("")}`.trim(),
      };
    })
    .sort((a, b) => b.wins - a.wins || b.appearances - a.appearances);
  t.addRows(tableData);
  t.printTable();
}

const logWeeklyMatchups = (years, weeks) =>
  years.forEach((y) => {
    weeks.forEach((w) => {
      const week = require(`./data/${y}/matchups/${w}.json`);

      const grouped = week.reduce((acc, cur) => {
        if (acc[cur.matchup_id]) {
          acc[cur.matchup_id].push(cur);
        } else {
          acc[cur.matchup_id] = [cur];
        }

        return acc;
      }, {});

      Object.keys(grouped).forEach((key) => {
        const matchup = grouped[key];

        console.log(`
          ${getUserByRosterId(matchup[0].roster_id)?.metadata.team_name} vs ${
          getUserByRosterId(matchup[1].roster_id)?.metadata.team_name
        }
        `);
      });
    });
  });

const getSleeperId = (name) =>
  managers.find((m) => m.id.toLowerCase() === name.toLowerCase()).sleeper.id;

const ALL_YEARS = [
  2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025
];

const FOURTEEN_GAMES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
const THIRTEEN_GAMES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

const logHeadToHead = (a, b) => {
  const ownerIdA = getSleeperId(a);
  const ownerIdB = getSleeperId(b);
  const results = [];
  ALL_YEARS.forEach((y) => {
    const rosters = require(`../data/${y}/rosters.json`);
    const rosterIdA = rosters.find((r) => r.owner_id === ownerIdA)?.roster_id;
    const rosterIdB = rosters.find((r) => r.owner_id === ownerIdB)?.roster_id;

    if (rosterIdA == null && rosterIdB == null) {
      return;
    }

    const weeks = y <= 2013 || y >= 2021 ? FOURTEEN_GAMES : THIRTEEN_GAMES;

    weeks.forEach((w) => {
      let matchups;
      try {
        matchups = require(`../data/${y}/matchups/${w}.json`);
      } catch {
        return;
      }
      let matchupA;
      let matchupB;
      matchups.forEach((m) => {
        if (matchupA != null && matchupB != null) {
          return;
        }

        if (m.roster_id === rosterIdA) {
          matchupA = m;
        }

        if (m.roster_id === rosterIdB) {
          matchupB = m;
        }
      });

      if (matchupA && matchupB && matchupA.matchup_id === matchupB.matchup_id) {
        // our teams played this week
        results.push({
          year: y,
          week: w,
          teamA: {
            username: a,
            owner_id: ownerIdA,
            matchup: matchupA,
          },
          teamB: {
            username: b,
            owner_id: ownerIdB,
            matchup: matchupB,
          },
        });
      }
    });
  });

  console.log(`${a} vs ${b} - ${results.length} games` + "\n");
  const totals = {
    [a]: 0,
    [b]: 0,
    tie: 0,
  };
  results.map((r, i) => {
    if (r.teamA.matchup.points > r.teamB.matchup.points) {
      // a won
      totals[a] = totals[a] + 1;
    } else if (r.teamB.matchup.points > r.teamA.matchup.points) {
      // b won
      totals[b] = totals[b] + 1;
    } else {
      // draw
      totals.tie = totals.tie + 1;
    }
    console.log(
      `Matchup ${i + 1} (${r.year} week ${r.week}): ${
        r.teamA.username
      } ${r.teamA.matchup.points.toFixed(2)} - ${r.teamB.matchup.points.toFixed(
        2
      )} ${r.teamB.username}`
    );
  });
  console.log(
    "\n" +
      `ALL TIME H2H: ${a} ${totals[a]} - ${totals[b]} ${b} ${
        totals.tie ? `(${totals.tie} tie)` : ""
      }` +
      "\n" +
      `Average score: ${a} ${(
        results.reduce((acc, cur) => {
          return acc + cur.teamA.matchup.points;
        }, 0) / results.length
      ).toFixed(2)} - ${(
        results.reduce((acc, cur) => {
          return acc + cur.teamB.matchup.points;
        }, 0) / results.length
      ).toFixed(2)} ${b}`
  );

  // console.table(resultsData);
};

logHeadToHead("thd", "brock");
console.log("\n");
logHeadToHead("htc", "kitch");
console.log("\n");
logHeadToHead("dix", "rich");
console.log("\n");
logHeadToHead("hadkiss", "sol");
console.log("\n");
logHeadToHead("ant", "fin");
console.log("\n");
logHeadToHead("jay", "ryan");

logRecords(ALL_YEARS);
logRecords([2023, 2024], true);

// logPlayoffWinLossRecord(ALL_YEARS);

const logScoringBuckets = () =>
  managers.forEach((m) => {
    const x = [];

    ALL_YEARS.forEach((y) => {
      const weeks = y <= 2013 || y >= 2021 ? FOURTEEN_GAMES : THIRTEEN_GAMES;

      weeks.forEach((w) => {
        try {
          const matchups = require(`../data/${y}/matchups/${w}.json`);
          const rosterId = getRosterByOwnerId(y, m.sleeper.id).roster_id;
          const matchup = matchups.find(
            (match) =>
              match.user_id === m.sleeper.id || match.roster_id === rosterId
          );
          x.push(matchup.points);
        } catch (e) {
          // console.log(y, w);
        }
      });
    });

    x.sort((a, b) => a - b);

    // log out the mean, median, and range
    const total = x.reduce((acc, cur) => acc + cur, 0);
    const mean = x.reduce((acc, cur) => acc + cur, 0) / x.length;
    const median = x[Math.floor(x.length / 2)];

    // log out how many times they scored below 50, 50-60, 60-70, 70-80, 80-90, 90-100, 100-110, 110-120, 120+
    const buckets = {
      ["<50"]: 0,
      ["50-60"]: 0,
      ["60-70"]: 0,
      ["70-80"]: 0,
      ["80-90"]: 0,
      ["90-100"]: 0,
      ["100-110"]: 0,
      ["110-120"]: 0,
      ["120-130"]: 0,
      ["130-140"]: 0,
      ["140-150"]: 0,
      ["150+"]: 0,
    };

    x.forEach((score) => {
      if (score < 50) {
        buckets["<50"] = buckets["<50"] + 1;
      } else if (score < 60) {
        buckets["50-60"] = buckets["50-60"] + 1;
      } else if (score < 70) {
        buckets["60-70"] = buckets["60-70"] + 1;
      } else if (score < 80) {
        buckets["70-80"] = buckets["70-80"] + 1;
      } else if (score < 90) {
        buckets["80-90"] = buckets["80-90"] + 1;
      } else if (score < 100) {
        buckets["90-100"] = buckets["90-100"] + 1;
      } else if (score < 110) {
        buckets["100-110"] = buckets["100-110"] + 1;
      } else if (score < 120) {
        buckets["110-120"] = buckets["110-120"] + 1;
      } else if (score < 130) {
        buckets["120-130"] = buckets["120-130"] + 1;
      } else if (score < 140) {
        buckets["130-140"] = buckets["130-140"] + 1;
      } else if (score < 150) {
        buckets["140-150"] = buckets["140-150"] + 1;
      } else {
        buckets["150+"] = buckets["150+"] + 1;
      }
    });

    console.log({
      manager: m.teamName,
      total,
      mean,
      median,
      buckets,
      ["100s"]: x.filter((s) => s >= 100).length,
    });
  });

const logScoringRanksByYear = () => {
  const years = ALL_YEARS;
  const data = {};

  years.forEach((y) => {
    const rosters = require(`../data/${y}/rosters.json`);

    const sortedRosters = rosters.sort((a, b) => {
      return b.settings.fpts - a.settings.fpts;
    });

    sortedRosters.forEach((r, i) => {
      const x = {
        rank: i + 1,
        owner_id: r.owner_id,
        name: getUserByOwnerId(y, r.owner_id).display_name,
        fpts: formatNumber(r.settings.fpts, r.settings.fpts_decimal),
      };

      if (!data[x.name]) {
        data[x.name] = [x.rank];
      } else {
        data[x.name] = [...data[x.name], x.rank];
      }
    });
  });

  console.log(data);
};

// logScoringRanksByYear();

const logBreakdown = (years = ALL_YEARS) => {
  const data = {};

  years.forEach((y) => {
    const weeks = y <= 2013 || y >= 2021 ? FOURTEEN_GAMES : THIRTEEN_GAMES;

    weeks.forEach((week) => {
      try {
        const matchups = require(`../data/${y}/matchups/${week}.json`);

        // go through each matchup for the week and see how many games they would have won or lost that week against every other team
        matchups.forEach((m) => {
          const user = getUserByRosterId(y, m.roster_id);

          const points = formatNumber(m.points, m.points_decimal);

          if (!data[user.user_id]) {
            data[user.user_id] = {
              wins: 0,
              losses: 0,
              ties: 0,
            };
          }

          matchups.forEach((o) => {
            if (m.roster_id === o.roster_id) {
              return;
            }
            const opponentPoints = formatNumber(o.points, o.points_decimal);

            if (points > opponentPoints) {
              data[user.user_id].wins = data[user.user_id].wins + 1;
            } else if (points === opponentPoints) {
              data[user.user_id].ties = data[user.user_id].ties + 1;
            } else {
              data[user.user_id].losses = data[user.user_id].losses + 1;
            }
          });
        });
      } catch (e) {}
    });
  });

  const t = new Table({ title: "All-Time Breakdown" });
  t.addRows(
    Object.entries(data)
      .map(([name, record]) => {
        return {
          name: managers.find((m) => m.sleeper.id === name).teamName,
          wins: record.wins,
          losses: record.losses,
          ties: record.ties,
          winPerc: (
            (record.wins / (record.wins + record.losses + record.ties)) *
            100
          ).toFixed(2),
        };
      })
      .sort((a, b) => b.winPerc - a.winPerc)
  );
  t.printTable();
};

// logBreakdown(ALL_YEARS);

const getUserPlayers = (user) => {
  const ownerId = getSleeperId(user);
  const starters = [];
  const starterCounts = {};

  ALL_YEARS.forEach((y) => {
    const rosters = require(`../data/${y}/rosters.json`);
    const rosterId = rosters.find((r) => r.owner_id === ownerId)?.roster_id;

    const weeks = y <= 2013 || y >= 2021 ? FOURTEEN_GAMES : THIRTEEN_GAMES;
    weeks.forEach((w) => {
      let matchups;
      try {
        matchups = require(`../data/${y}/matchups/${w}.json`);
      } catch {
        return;
      }

      matchups.forEach((m) => {
        if (m.roster_id === rosterId) {
          starters.push(...m.starters);
        }
      });
    });
  });

  starters.forEach((s) => {
    const player = playerData?.[s]?.full_name ? playerData[s].full_name : s;
    starterCounts[player] = starterCounts[player]
      ? starterCounts[player] + 1
      : 1;
  });

  console.log(
    Object.fromEntries(
      Object.entries(starterCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15)
    )
  );
};

// managers.forEach((m) => {
//   console.log("\n");
//   console.log(m.teamName);
//   getUserPlayers(m.name);
//   console.log("====================");
// });
