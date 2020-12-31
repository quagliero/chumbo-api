const rp = require('request-promise');
const pQueue = require('p-queue');
const cheerio = require('cheerio');
const ora = require('ora');
const chalk = require('chalk');
const r = require('ramda');
const Table = require('tty-table');
const cfonts = require('cfonts');
const fs = require('fs');
const { settings } = require('cluster');

const spinner = ora();

// spinner.start('Parsing Chumbolone Data');

const urlBase = 'http://fantasy.nfl.com/league/874089/history';
const years = r.range(2012, r.inc(2020));
const currentWeek = 14;

const managers = [
  {
    id: 'thd',
    name: 'thd',
    teamName: 'King of Wishful Tinkering',
    userId: ['2820383'],
    teamId: '1',
    sleeper: {
      id: '77140390129844224',
      display_name: 'thd',
    },
  },
  {
    id: 'jay',
    name: 'jay',
    teamName: 'Kansas City Chumps',
    crowns: 2,
    userId: ['2833865'],
    teamId: '2',
    sleeper: {
      id: '428943291145265152',
      display_name: 'jmshelley',
    },
  },
  {
    id: 'hadkiss',
    name: 'hadkiss',
    teamName: 'Bush Johnson',
    crowns: 1,
    userId: ['2839340'],
    teamId: '3',
    sleeper: {
      id: '337210029620883456',
      display_name: 'BushJohnson',
    },
  },
  {
    id: 'fin',
    name: 'fin',
    teamName: 'Tha Dollar',
    crowns: 1,
    userId: ['2873481'],
    teamId: '4',
    sleeper: {
      id: '438629899490553856',
      display_name: 'TheDollar',
    },
  },
  {
    id: 'dix',
    name: 'dix',
    teamName: 'SIIBON',
    crowns: 2,
    userId: ['2886224', '6557238', '14118531'],
    teamId: '5',
    sleeper: {
      id: '337221174670938112',
      display_name: 'Si2on',
    },
  },
  {
    id: 'ant',
    name: 'ant',
    teamName: 'Wolverhampton Wasters',
    crowns: 1,
    userId: ['2899570'],
    teamId: '6',
    sleeper: {
      id: '337297176361201664',
      display_name: 'anthonyxyz',
    },
  },
  {
    id: 'jimmie',
    name: 'jimmie',
    teamName: 'Jimbo\'s Chiefs',
    active: false,
    userId: ['576154'],
    teamId: {
      2012: '7',
    },
    sleeper: {
      id: 'chumbolegacy_jimmie',
      display_name: 'Jimmie',
    }
  },
  {
    id: 'kitch',
    name: 'kitch',
    teamName: 'The Roaches',
    userId: ['1245126'],
    teamId: '8',
    sleeper: {
      id: '77361676378587136',
      display_name: 'DJKJnr'
    },
  },
  {
    id: 'karsten',
    name: 'karsten',
    teamName: 'Team EZ',
    active: false,
    userId: ['2725162'],
    teamId: {
      2012: '9',
    },
    sleeper: {
      id: 'chumbolegacy_karsten',
      display_name: 'Karsten',
    }
  },
  {
    id: 'rich',
    name: 'rich',
    teamName: 'Zaragoza\'s Zooting Zorro',
    userId: ['3832177'],
    teamId: '10',
    sleeper: {
      id: '337222928615612416',
      display_name: 'rich45',
    },
  },
  {
    id: 'brock',
    name: 'brock',
    teamName: 'The Disciples of Juan Carlos',
    active: false,
    userId: ['4205393'],
    teamId: {
      2013: '7',
      2014: '7',
      2015: '7',
    },
    sleeper: {
      id: 'chumbolegacy_euan',
      display_name: 'Euan',
    }
  },
  {
    id: 'htc',
    name: 'htc',
    userId: ['5045797'],
    teamName: '21st & Hine',
    teamId: '9',
    sleeper: {
      id: '337226046606704640',
      display_name: 'davidino56',
    },
  },
  {
    id: 'sol',
    name: 'sol',
    userId: ['7344145'],
    teamName: 'The Unicorn',
    crowns: 1,
    teamId: {
      current: '7',
      2014: '11',
      2015: '11',
    },
    weeks: {
      2015: [1,2,3,4,5,6,7,8],
      2020: [1,2,3,4,5,6,7,9,10,11,12,13,14,15,16],
    },
    sleeper: {
      id: '411186928751230976',
      display_name: 'manzielsunicorn'
    },
  },
  {
    id: 'chris',
    name: 'chris',
    teamName: 'Suh Suh Sudio',
    active: false,
    userId: ['3306975'],
    teamId: {
      2014: '12',
      2015: '12',
      2016: '12',
      2017: '12',
      2018: '12',
      2020: '7',
    },
    weeks: {
      2020: [8],
    },
    sleeper: {
      id: 'chumbolegacy_sudio',
      display_name: 'Chris'
    }
  },
  {
    id: 'phil',
    name: 'phil',
    teamName: 'Consolation Prize',
    active: false,
    userId: ['7381941'],
    teamId: {
      2015: 11,
      2016: 11,
    },
    weeks: {
      2015: [9,10,11,12,13,14,15,16],
      2016: [1,2,3,4,5,6,7,8,9],
    },
    sleeper: {
      id: 'chumbolegacy_phil',
      display_name: 'Phil',
    }
  },
  {
    id: 'nick',
    name: 'nick',
    teamName: 'Catch-22',
    userId: ['2454671'],
    teamId: {
      current: '11',
      2016: '11',
    },
    weeks: {
      2016: [10,11,12,13,14,15,16],
    },
    sleeper: {
      id: '429243125446230016',
      display_name: 'DontPanic22'
    },
  },
  {
    id: 'ryan',
    name: 'ryan',
    teamName: 'Pimpin Ain\'t Leesy', 
    userId: ['19850746'],
    teamId: {
      2019: '12',
      current: 12,
    },
    sleeper: {
      id: '359110473351696384',
      display_name: 'ryanlees',
    },
  }
];

const formatNumber = (num) => Math.round(num * 1e2) / 1e2;

const median = (arr) => {
  const mid = Math.floor(arr.length / 2),
    nums = [...arr].sort((a, b) => a - b);
  return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
};

const getManager = (year, week, teamId) => r.find((manager) => {
  // has left and/or taken control of another team
  if (r.is(Object, manager.teamId)) {
    // was managing this team in this year
    if (manager.teamId[year] == teamId) {
      // was partially managing the team this year
      if (manager.weeks && manager.weeks[year]) {
        // was he managing the team this specific week?
        if (r.contains(week, manager.weeks[year])) {
          return true;
        } else {
          // no he was not
          return false;
        }
      }
    }

    // managed the team throughout this year
    if (manager.teamId[year] == teamId) {
      return true;
    }

    // took over a team and this is now his
    if (manager.teamId.current == teamId) {
      return true;
    }
  }

  // easy peasy, manager never left
  if (manager.teamId == teamId) {
    return true;
  }

  // no joy
  return false;
}, managers);

const getTeamId = (manager, year, week) => {
  const weekMatch = manager?.weeks?.[year]?.indexOf(week);
  if (weekMatch) {
    return manager.teamId[year];
  }

  const yearMatch = manager.teamId[year];
  if (yearMatch) {
    return yearMatch;
  }

  const current = manager.teamId.current;

  if (current) {
    return current;
  }

  return manager.teamId;
}

const parseWeek = (year, week, teams = {}) => new Promise((resolve) => {
  rp(`${urlBase}/${year}/schedule?scheduleDetail=${week}`).then((html) => {
    // spinner.info(`Fetching week ${week} results from ${year}`);
    const $ = cheerio.load(html);
    const $matchups = $('.scheduleContent .matchups > ul > li');
    const matchups = [];
    const sleeper = [];
    let count = 0;
    $matchups.each((i, el) => {
      const $matchup = $(el);
      const $team1 = $matchup.find($('.teamWrap-1 .teamTotal'));
      const $team2 = $matchup.find($('.teamWrap-2 .teamTotal'));
      const manager1 = getManager(year, week, $team1.attr('class').split('teamId-')[1]);
      const manager2 = getManager(year, week, $team2.attr('class').split('teamId-')[1]);

      const divisional = (
        year >= 2017 &&
        teams[manager1.id] && teams[manager2.id] &&
        teams[manager1.id].division === teams[manager2.id].division
      ) ? true : false;

      matchups.push([
        [
          manager1.id,
          Number($team1.text()),
        ],
        [
          manager2.id,
          Number($team2.text()),
        ],
        {
          week,
          year,
          divisional,
        }
      ]);

      const points = {
        [manager1.id]: Number($team1.text()),
        [manager2.id]: Number($team2.text()),
      };

      [ manager1, manager2 ].forEach((m) => {
        const teamId = getTeamId(m, year, week);
        parseTeamRoster(teamId, year, week).then((data) => {
          count++;
          sleeper.push({
            matchup_id: i + 1,
            roster_id: m.sleeper.id,
            points: points[m.id],
            starters: data.reduce((acc, cur) => {
              if (cur.starter) {
                acc.push(cur);
              }
              return acc;
            }, []),
            players: data.reduce((acc, cur) => {
              acc.push(cur);
              return acc;
            }, []),
          });
          // got them all
          if (count === matchups.length * 2) {
            fs.writeFile(`./raw_data/${year}/matchups/${week}.json`, JSON.stringify(sleeper, null, 2), 'utf-8', (err) => {
              if (err) throw err;
            });
            console.log(`${year} week ${week} matchups written to ./raw_data/${year}/matchups/${week}.json`);
          }
        });
      })
    });

    resolve(matchups);
  });
});

const DIVISION_MAP = {
  0: 0,
  1: 0,
  2: 0,
  3: 1,
  4: 1,
  5: 1,
  6: 2,
  7: 2,
  8: 2,
  9: 3,
  10: 3,
  11: 3,
};

const hack2020 = {
  rich: {
    wins: 7,
    losses: 6,
  },
  dix: {
    wins: 6,
    losses: 7,
  },
  ryan: {
    wins: 4,
    losses: 9,
  },
  hadkiss: {
    wins: 8,
    losses: 5,
  },
  htc: {
    wins: 7,
    losses: 6,
  },
  jay: {
    wins: 5,
    losses: 8,
  },
  nick: {
    wins: 9,
    losses: 4,
  },
  ant: {
    wins: 6,
    losses: 7,
  },
  kitch: {
    wins: 6,
    losses: 7,
  },
  thd: {
    wins: 10,
    losses: 3,
  },
  fin: {
    wins: 6,
    losses: 7,
  },
  sol: {
    wins: 4,
    losses: 9,
  }
};

const parseRegularSeasonStandings = (year) => new Promise((resolve) => {
  spinner.info(`Fetching ${year} standings`);
  rp(`${urlBase}/${year}/standings?historyStandingsType=regular`).then((html) => {
    const standingsData = {};
    const managerQueue = new pQueue();
    const $ = cheerio.load(html);
    let $standings = $('#leagueHistoryStandings table tbody tr');
    
    // nfl.com seems to have a hidden double row of first team on division seasons
    if (year >= 2017) {
      $standings = $standings.slice(1,13);
    }

    const divisions = $('#leagueHistoryStandings .tableWrap h5').map((i, el) => {
      return $(el).text().split(':')[1].trim();
    });
    

    $standings.each((i, el) => {
      const $el = $(el);
      const teamHref = $el.find('.teamImageAndName a.teamName').attr('href');
      const teamId = teamHref.split('teamId=')[1];
      const record = $el.find('.teamRecord').text().split('-');
      const division = divisions[DIVISION_MAP[i]];

      managerQueue.add(() => new Promise((mResolve) => {
        rp(`${urlBase}/${year}/owners`).then((html) => {
          const $ = cheerio.load(html);
          const $manager = $(`#leagueOwners tr.team-${teamId}`);
          const id = $manager.find('.userName').attr('class').split('userId-')[1];
          mResolve(id);
        });
      })).then((mId) => {
        const manager = r.find(r.propSatisfies(r.contains(mId), 'userId'), managers);
        let wins, losses, ties;

        if (year === 2020) {
          wins = hack2020[manager.id].wins;
          losses = hack2020[manager.id].losses;
          ties = 0;
        } else {
          wins = Number(record[0]);
          losses = Number(record[1]);
          ties = Number(record[2]);
        }

        standingsData[manager.id] = {
          id: manager.id,
          name: manager.teamName,
          wins,
          losses,
          ties,
          division: division,
        };
      });

    });

    managerQueue.onIdle().then(() => resolve(standingsData));
  });
});

// years.forEach(parseRegularSeasonStandings);

const parseTeamRoster = (team, year, week) => new Promise((resolve) => {
  rp(`${urlBase}/${year}/teamhome?teamId=${team}&week=${week}&statWeek=${week}&statType=weekStats`).then((html) => {
    const $ = cheerio.load(html);
    const $roster = $('.tableWrap table > tbody > tr');
    const rosterData = [];

    $roster.each((i, el) => {
      if (el.attribs.class.indexOf('odd') > -1 || el.attribs.class.indexOf('even') > -1) {
        // filter out bench, we only want starts
        // `player-20- seems to be used only on bench spots
        // if (el.attribs.class.indexOf('player-20-') === -1) {
          const $player = $(el);
          rosterData.push({
            name: $player.find('.playerNameFull').text(),
            position: $player.find('.playerNameAndInfo > div > em').text().split(' - ')[0],
            starter: el.attribs.class.indexOf('player-20-') === -1
          });
        // }
      }
    });
    resolve(rosterData);
  });
});

const rosterHistory = (yrs, team, title) => {
  let rosterRaw = {};
  let roster = {};
  const queue = new pQueue();

  yrs.forEach((year) => {
    r.range(1, 17).forEach((week) => {
      if (year === years[years.length - 1] && week >= currentWeek) {
        return false;
      }
      queue.add(() => parseTeamRoster(team, year, week)).then((data) => {
        rosterRaw[year] = rosterRaw[year] || {};
        rosterRaw[year][week] = data;
      });
    });
  });

  queue.onIdle().then(() => {
    if (Object.keys(rosterRaw).length === 0) {
      return false;
    }

    Object.keys(rosterRaw).forEach((year) => {
      Object.keys((rosterRaw[year])).forEach((week) => {
        rosterRaw[year][week].forEach((player) => {
          roster[player.name] = r.inc(r.defaultTo(0, roster[player.name]));
        });
      });
    });
    console.log(title);
    console.log(r.toPairs(roster).sort((a,b) => {
      if (a[1] > b[1]) {
        return -1;
      } else if (a[1] < b[1]) {
        return 1
      } else {
        return 0;
      }
    }));
  });
};

const makeOutcomeAmendments = (standings, years) => {
  // in here we apply all the hacks that take/give wins to the right
  // people based on times when managers left and others took over
  // if you leave through a season you are given L's for each remaining game
  // the team that takes over takes the 'actual' record from then on

  if (years.indexOf(2015) > -1) {
    // ammendment 1:
    // Sol leaves week 9 2015, forfeiting weeks 9-13 (5 games)
    standings.sol.forfeits = 5;
    // Phil joins week 9 2015, so the record of 2-6 that he inherited is removed from him and added to sol
    // Phil played 14 games total
    standings.sol.wins += 2;
    standings.sol.losses += (6 + 5); // 6 + 5 forfeits
    standings.phil.wins -= 2;
    standings.phil.losses -= 6;
  }

  if (years.indexOf(2016) > -1) {
    if (standings.phil) {
      // ammendment 2:
      // Phil leaves week 10 2016, forfeiting weeks 10-13 (4 games)
      standings.phil.forfeits = 4;
      // Wadlow joines week 10 2016, going 3-1, but the record of 3-6 at this point is phil's
      standings.phil.wins += 3;
      standings.phil.losses += (6 + 4); // 6 + 4 forfeits
    }
    standings.nick.wins -= 3;
    standings.nick.losses -= 6;
  }

  return standings;
};

const scrape = (yrs, title, tiers) => {
  const history = {};
  const cumulative = {};
  const queue = new pQueue();

  yrs.forEach((year) => {
    queue.add(() => parseRegularSeasonStandings(year)).then((data) => {
      history[year] = {
        standings: data,
      };
    }).then(() => {
      history[year].schedule = {};
      r.range(1, (year >= 2014 ? 14 : 15)).forEach((week) => {
        if (year === years[years.length - 1] && week >= currentWeek) {
          return false;
        }

        queue.add(() => parseWeek(year, week, history[year].standings)).then((data) => {
          history[year].schedule[week] = data;
        });
      });
    });
  });

  queue.onIdle().then(() => {
    if (Object.keys(history).length === 0) {
      return false;
    }

    // fs.writeFile('history.json', JSON.stringify(history), (err) => {
    //   if (err) return console.log(err);
    //   console.log('history > history.json');
    // });

    r.map((year) => {
      r.mapObjIndexed((stats, team) => {
        const tm = cumulative[team];
        if (tm) {
          cumulative[team].wins = r.add(tm.wins, stats.wins);
          cumulative[team].losses = r.add(tm.losses, stats.losses);
          cumulative[team].ties = r.add(tm.ties, stats.ties);
        } else {
          const mgr = managers.find((m) => m.id === team);
          cumulative[team] = {
            name: mgr.teamName,
            wins: Number(stats.wins),
            losses: Number(stats.losses),
            ties: Number(stats.ties),
            forfeits: 0,
            winPerc: 0,
            for: [],
            against: [],
            divWins: 0,
            divLosses: 0,
          };
        }
      }, year.standings);


      r.mapObjIndexed((matchups, week) => {
        r.map((matchup) => {
          if (cumulative[matchup[0][0]]) {
            const pfor = matchup[0][1];
            const pag = matchup[1][1];
            cumulative[matchup[0][0]].for.push(pfor);
            cumulative[matchup[0][0]].against.push(pag);

            if (matchup[2].divisional) {
              if (pfor > pag) {
                cumulative[matchup[0][0]].divWins += 1;
              } else {
                cumulative[matchup[0][0]].divLosses += 1;
              }
            }
          }
          if (cumulative[matchup[1][0]]) {
            const pfor = matchup[1][1];
            const pag = matchup[0][1];
            cumulative[matchup[1][0]].for.push(pfor);
            cumulative[matchup[1][0]].against.push(pag);

            if (matchup[2].divisional) {
              if (pfor > pag) {
                cumulative[matchup[1][0]].divWins += 1;
              } else {
                cumulative[matchup[1][0]].divLosses += 1;
              }
            }
          }
        }, matchups);
      }, year.schedule);
    })(history);
    

    const adjusted = makeOutcomeAmendments(cumulative, yrs);

    const averaged = r.map((team) => {
      const totalFor = team.for.reduce((prev, cur) => prev + cur, 0);
      const totalAgainst = team.against.reduce((prev, cur) => prev + cur, 0);

      const total = (team.wins + team.losses + team.ties);
      const totalPlayed = total - team.forfeits;

      const winPerc = formatNumber((team.wins + (team.ties / 2)) / total * 100);
      const avgFor = formatNumber(totalFor / totalPlayed);
      const medianFor = formatNumber(median(team.for));
      const medianAgainst = formatNumber(median(team.against));
      const avgAgainst = formatNumber(totalAgainst / totalPlayed);

      return r.merge(team, {
        winPerc,
        for: formatNumber(totalFor),
        against: formatNumber(totalAgainst),
        avgFor,
        // medianFor,
        avgAgainst,
        // medianAgainst,
        // divWins: formatNumber(team.divWins),
        // divLosses: formatNumber(team.divLosses),
      });
    }, adjusted);

    const sorted = r.pipe(
      r.filter((team) => {
        // remove inactive teams
        if (tiers) {
          return ['karsten', 'phil', 'jimmie', 'brock', 'Disciples of Aaron Rodgers', 'chris', 'Suh Suh Sudio'].every((tm) => team.name !== tm);
        }

        return r.identity;
      }),
      r.values,
      r.sortWith([
        r.descend(r.prop('winPerc')),
        r.descend(r.prop('avgFor')),
        r.descend(r.prop('avgAgainst')),
        r.descend(r.prop('wins')),
      ]),
    )(averaged);

    const tierList = r.map((team) => team.name, sorted);

    const tableData = r.map(r.pipe(
      r.values,
      r.remove(4,1),
    ), sorted);

    const table = new Table(
      [
        { value: 'Team', formatter: (value) => {
          const manager = managers.find((m) => m.teamName === value);

          if (tiers) {
            if (tierList.indexOf(value) >= 8) {
              value = chalk.white.bgRed(value);
            } else if (tierList.indexOf(value) >= 4) {
              value = chalk.white.bgBlue(value);
            } else {
              value = chalk.white.bgGreen(value);
            }
          }

          // identify inactive teams
          if (manager.active === false) {
            value = chalk.white.cyan(`${value} (X)`);
          }

          // add crowns
          if (manager.crowns && !tiers) {
            value = manager.teamName.concat(` ${'🏆'.repeat(manager.crowns || 0)}`);
          }

          return value;
        } },
        { value: 'Wins', },
        { value: 'Losses' },
        { value: 'Ties' },
        { value: '%' },
        { value: 'For' },
        { value: 'Against' },
        { value: 'Div Wins' },
        { value: 'Div Loses' },
        { value: 'Avg. For' },
        // { value: 'Median For' },
        { value: 'Avg. Against' },
        // { value: 'Median Against' },
      ],
      tableData,
      {
        align: 'left',
      }
    );

    cfonts.say(`\n${title}`, {
      font: 'chrome',
      align: 'center',
    });
    console.log(table.render());
  });

};

const allWeeks = () => years.map((year) => r.range(1, (year >= 2014 ? 14 : 15)).map((week) => {
  if (year === years[years.length - 1] && week >= currentWeek) {
    return null;
  }
  return parseWeek(year, week);
}));

const getWeek = (week) => years.map((year) => {
  // we don't play reg season games in week 14 after the 2013 season
  // and don't get a week we havne't played yet
  if (year >= 2014 && week >= 14 || (year === years[years.length - 1] && week >= currentWeek)) {
    return [];
  }

  return parseWeek(year, week);
});

const getWeekRecord = (week) => Promise.all(getWeek(week)).then((years) => {
  cfonts.say(` Week ${week}`);
  const results = {};

  years.forEach((week) => {
    week.forEach((matchup) => {
      if (!results[matchup[0][0]]) {
        results[matchup[0][0]] = {
          name: matchup[0][0],
          wins: 0,
          losses: 0,
          ties: 0,
          for: 0,
          against: 0,
        };
      }
      if (!results[matchup[1][0]]) {
        results[matchup[1][0]] = {
          name: matchup[1][0],
          wins: 0,
          losses: 0,
          ties: 0,
          for: 0,
          against: 0,
        };
      }

      results[matchup[0][0]].for += matchup[0][1];
      results[matchup[0][0]].against += matchup[1][1];
      results[matchup[1][0]].for += matchup[1][1];
      results[matchup[1][0]].against += matchup[0][1];

      if (matchup[0][1] > matchup[1][1]) {
        // home win
        results[matchup[0][0]].wins += 1;
        results[matchup[1][0]].losses += 1;
      }
      if (matchup[0][1] < matchup[1][1]) {
        // away win
        results[matchup[0][0]].losses += 1;
        results[matchup[1][0]].wins += 1;
      }
      if (matchup[0][1] == matchup[1][1]) {
        // tie
        results[matchup[0][0]].ties += 1;
        results[matchup[1][0]].ties += 1;
      }
    });
  });

  const sorted = r.values(results).map((team) => {
    const total = team.wins + team.losses + team.ties;
    return Object.assign({}, team, {
      winPerc: formatNumber((team.wins + (team.ties / 2)) / total * 100),
      for: formatNumber(team.for / total),
      against: formatNumber(team.against / total),
    });
  })
    .filter((team) => ['karsten', 'phil', 'brock', 'Disciples of Aaron Rodgers', 'jimmie', 'chris', 'Suh Suh Sudio'].every((tm) => team.name !== tm))
    .sort((a, b) => {
      if (a.winPerc > b.winPerc) {
        return -1;
      }

      if (a.winPerc < b.winPerc) {
        return 1;
      }

      if (a.for > b.for) {
        return -1;
      }

      if (a.for < b.for) {
        return 1;
      }
      
      return 0;
    });

  const tableData = r.values(r.map(r.values, sorted));

  const table = new Table(
    [
      { value: 'Team' },
      { value: 'Wins', },
      { value: 'Losses' },
      { value: 'Ties' },
      { value: 'For' },
      { value: 'Against' },
      { value: '%' },
    ],
    tableData,
    {
      align: 'left',
    }
  );

  console.log(table.render());
});

const getHeadToHead = (a, b) => Promise.all(r.filter(r.identity, r.flatten(allWeeks()))).then((gameWeeks) => {
  const results = [];
  const details = {
    [a]: {
      wins: 0,
      losses: 0,
      ties: 0,
    },
    [b]: {
      wins: 0,
      losses: 0,
      ties: 0,
    },
  };
  gameWeeks.forEach((week) => {
    week.forEach((game) => {
      if (game[0][0] === a || game[1][0] == a) {
        if (game[0][0] === b || game[1][0] == b) {
          results.push(game);
        }
      }
    });
  });
  cfonts.say(`${a} vs ${b}`);
  results.forEach((result) => {
    if (result[0][1] > result[1][1]) {
      // home win
      details[result[0][0]].wins += 1;
      details[result[1][0]].losses += 1;
    }
    if (result[0][1] < result[1][1]) {
      // away win
      details[result[0][0]].losses += 1;
      details[result[1][0]].wins += 1;
    }
    if (result[0][1] == result[1][1]) {
      // tie
      details[result[0][0]].ties += 1;
      details[result[1][0]].ties += 1;
    }
  });

  results.forEach((game) => {
    console.log(`${game[0][0]} ${game[0][1]} - ${game[1][1]} ${game[1][0]} (Week ${game[2].week}, ${game[2].year})`);
  });
  let tie = (details[a].ties > 0) ? `(${details[a].ties} tie)` : '';
  console.log(`\nAll-time: ${a} ${details[a].wins} - ${details[b].wins} ${b} ${tie}`);
});

// [
//   [ 'thd', 'sol' ],
//   [ 'dix', 'rich' ],
//   [ 'jay', 'fin' ],
//   [ 'hadkiss', 'htc' ],
//   [ 'ryan', 'kitch' ],
//   [ 'ant', 'nick' ],
// ].forEach((matchup) => getHeadToHead(matchup[0], matchup[1]));

// getWeekRecord(13);
// scrape(years, 'All-Time Records');
// scrape(r.slice(-3, Infinity, years), 'Tiers', true);
// scrape([2012]);

// parseWeek(2012, 16);


const parsePicks = (year) => new Promise((resolve) => {
  rp(`${urlBase}/${year}/draftresults?draftResultsDetail=0&draftResultsTab=round&draftResultsType=results`).then((html) => {
    const $ = cheerio.load(html);

    const $rounds = $('#leagueDraftResultsResults .results .wrap > ul');
    const picks = [];
    let roundCount = 0;

    $rounds.each((i, round) => {
      roundCount++;
      const $round = $(round);
      const $picks = $round.find('> li');

      $picks.each((k, pick) => {
        const $pick = $(pick);
        const pick_no = parseInt($pick.find('.count').text());
        const name = $pick.find('.playerNameFull').text();
        const position = $pick.find('.playerCard + em').text().split(' -')[0];
        const manager = getManager(year, 1, $pick.find('.teamName').attr('class').split('teamId-')[1]);

        const draft_slot = (roundCount % 2 === 0) ? $picks.length - k : k + 1;
        picks.push({
          name,
          position,
          round: i + 1,
          pick_no,
          picked_by: manager.sleeper.id,
          draft_slot,
        });
      });
    });

    fs.writeFileSync(`./raw_data/${year}/picks.json`, JSON.stringify(picks, null, 2), 'utf-8', (err) => {
      if (err) throw err;
    });
    console.log(`${year} draft picks written to ./raw_data/${year}/picks.json`);

    resolve();
  });
});

// parsePicks(2012);

// Users

const parseUsers = (year) => new Promise((resolve) => {
  rp(`${urlBase}/${year}/owners`).then((html) => {
    const $ = cheerio.load(html);
    const users = [];

    const $owners = $('#leagueOwners .tableType-team > tbody > tr');

    // Sol
    if (year === 2015) {
      users.push({
        user_id: managers[12].sleeper.id,
        display_name: managers[12].sleeper.display_name,
        league_id: `chumbo_${year}`,
        metadata: {
          team_name: managers[12].teamName,
        }
      });
    }

    // Phil
    if (year === 2016) {
      users.push({
        user_id: managers[14].sleeper.id,
        display_name: managers[14].sleeper.display_name,
        league_id: `chumbo_${year}`,
        metadata: {
          team_name: managers[14].teamName,
        }
      });
    }

    $owners.each((i, el) => {
      const $team = $(el).find('.teamImg');
      const avatar = $team.find('img').attr('src');
      const team_name = $team.find('img').attr('alt');
      const manager = getManager(year, 16, $team.attr('class').split('teamId-')[1]);

      users.push({
        user_id: manager.sleeper.id,
        display_name: manager.sleeper.display_name,
        league_id: `chumbo_${year}`,
        metadata: {
          avatar,
          team_name,
        }
      });
    });

    fs.writeFileSync(`./raw_data/${year}/users.json`, JSON.stringify(users, null, 2), 'utf-8', (err) => {
      if (err) throw err;
    })
    console.log(`${year} users written to ./raw_data/${year}/users.json`);
  });
});

// parseUsers(2016);

const parseRosters = (year) => new Promise(() => {
  const rosters = [];
  const count = year >= 2014 ? 12 : 10;

  for (let i = 1; i <= count; i ++) {
    rosters.push(
      new Promise((resolve) => parseTeamRoster(i, year, 16).then((roster) => {
        new Promise((resultResolve) => {
          rp(`${urlBase}/${year}/standings?historyStandingsType=regular`).then((html) => {
            const $ = cheerio.load(html);

            const $team = $(`#leagueHistoryStandings .tableType-team > tbody > tr.team-${i}`);
            const record = $team.find('.teamRecord').html().split('-')
            const points = $team.find('.teamPts').first().text().split('.');
            const points_against = $team.find('.teamPts.last').text().split('.');
            const manager = getManager(year, 16, i);

            const owner_id = manager.sleeper.id;
            const roster_id = i;
            const wins = Number(record[0]);
            const losses = Number(record[1]);
            const ties = Number(record[2]);
            const fpts = parseFloat(points[0].replace(/,/g, ''));
            const fpts_decimal = Number(points[1]);
            const fpts_against = parseFloat(points_against[0].replace(/,/g, ''));
            const fpts_against_decimal = Number(points_against[1]);
            const metadata = {};

            // phil took over from Sol in 2015
            if (year === 2015 && manager.id === 'phil') {
              metadata.co_owner = {
                owner_id: managers[12].sleeper.id, // sol
                wins: 2,
                losses: 6,
              };
            }

            // Nick took over from Phil in 2016
            if (year === 2016 && manager.id === 'nick') {
              metadata.co_owner = {
                owner_id: managers[14].sleeper.id, // phil
                wins: 3,
                losses: 6,
              };
            }

            resultResolve({
              league_id: `chumbo_${year}`,
              owner_id,
              roster_id,
              settings: {
                wins,
                losses,
                ties,
                fpts,
                fpts_decimal,
                fpts_against,
                fpts_against_decimal,
              },
              players: roster,
              metadata,
            });
          });
        }).then((rosterAndResult) => {
          new Promise((rosterAndResultResolve) => {
            rp(`${urlBase}/${year}/owners`).then((html) => {
              const $ = cheerio.load(html);

              const $team = $(`#leagueOwners .tableType-team > tbody > tr.team-${i}`);
              const moves = Number($team.find('.teamTransactionCount').text());
              const trades = Number($team.find('.teamTradeCount').text());

              rosterAndResult.settings.total_moves = moves + trades;
              rosterAndResultResolve(rosterAndResult);
            });
          }).then((rosterAndResultAndMoves) => {
            new Promise(() => {
              rp(`${urlBase}/${year}/schedule?standingsTab=schedule&scheduleType=team&scheduleDetail=${i}`).then((html) => {
                const $ = cheerio.load(html);
                const $weeks = $('#scheduleSchedule .tableType-weeks > tbody > tr');

                const record = [];

                $weeks.each((i, el) => {
                  // only count reg season
                  if ((i + 1) <= (year >= 2014 ? 13 : 14)) {
                    record.push(
                      $(el).find('.resultText').text().charAt(0)
                    );
                  }
                });
                rosterAndResultAndMoves.metadata.record = record.join('');

                resolve(rosterAndResultAndMoves);
              });
            })
          });
        })
      }))
    )
  }

  Promise.all(rosters).then((data) => {
    fs.writeFileSync(`./raw_data/${year}/rosters.json`, JSON.stringify(data, null, 2), 'utf-8', (err) => {
        if (err) throw err;
      });
      console.log(`${year} rosters written to ./raw_data/${year}/rosters.json`);
  });
});

// parseRosters(2012);

const parseSettings = (year) => new Promise((resolve) => {
  rp(`${urlBase}/${year}/settings`).then((html) => {
    const $ = cheerio.load(html);
    const $settings = $('.leagueSettings ul.formItems > li');
    const $roster = $('.leagueSettings ul.positionsAndRoster > li');
    const $scoring = $('.scoreSettings ul > li');
    const league = {
      season: `${year}`,
      name: `Chumbo ${year}`,
      settings: {
      },
      scoring_settings: {},
      roster_positions: [],
    };

    $settings.each((i, el) => {
      const key = $(el).find('em').text();
      const value = $(el).find('div').text();
      league.settings[key] = value;
    })

    $roster.each((i, el) => {
      const key = $(el).find('em').text();
      const value = $(el).find('div').text();

      league.roster_positions.push({ key, value });
    });

    $scoring.each((i, el) => {
      const key = $(el).find('em').text();
      const value = $(el).find('div').text();

      league.scoring_settings[key] = value;
    });

    fs.writeFileSync(`./raw_data/${year}/league.json`, JSON.stringify(league, null, 2), 'utf-8', (err) => {
      if (err) throw err;
    })
    console.log(`${year} league settings written to ./raw_data/${year}/league.json`)
    resolve(league);
    
  });
});

// parseSettings(2018);

const parseBracket = (year, consolation) => new Promise((resolve) => {
  const bracketType = consolation ? 'consolation' : 'championship';
  const fileName = consolation ? 'losers_bracket' : 'winners_bracket';
  rp(`${urlBase}/${year}/playoffs?bracketType=${bracketType}&standingsTab=playoffs`).then((html) => {
    const bracket = [];
    const $ = cheerio.load(html);

    const $bracket = $(`.playoffType-${bracketType} .playoffContent`);

    const $weeks = $bracket.find('> li');
    let matchup = 0;

    $weeks.each((i, el) => {
      const round = i + 1;
      // filter out 'hidden' <li>s by only getting those with pg class
      const $matchups = $(el).find('li[class^=pg]');

      $matchups.each((k, el) => {
        const $matchup = $(el);
        const isBye = $matchup.find('.teamWrap-bye').length > 0;

        if (!isBye) {
          // don't cound bye weeks as matchups
          matchup++;
          const $team1 = $matchup.find('.teamWrap-1');
          const $team2 = $matchup.find('.teamWrap-2');
          const manager1 = getManager(year, 16, $team1.find('.teamName').attr('class')?.split('teamId-')[1]);
          const manager2 = getManager(year, 16, $team2.find('.teamName').attr('class')?.split('teamId-')[1]);
          let winner, loser;
  
          // the higher seed won
          if ($matchup.hasClass('win')) {
            winner = manager1.sleeper.id;
            loser = manager2.sleeper.id;
            // console.log(`${manager1.teamName} beat ${manager2.teamName}`);
          } else {
          // the higher seed lost
            winner = manager2.sleeper.id;
            loser = manager1.sleeper.id;
            // console.log(`${manager2.teamName} beat ${manager1.teamName}`);
          }
  
          const data = {
            round,
            matchup,
            winner,
            loser,
            team_1: manager1.sleeper.id,
            team_2: manager2.sleeper.id,
          };
  
          if (true) {
            // semi final week
            if (($weeks.length === 3 && i === 1) || i === 0) {
              // first 2 matchups are semis
              // the rest would be byes so we can ignore
              if (k <= 1) {
                const t1_from = bracket.reduce((obj, b) => {
                  if (b.round === round - 1) {
                    if (b.winner === manager1.sleeper.id) {
                      obj.w = b.matchup;
                      return obj;
                    }
                  }
                  return obj;
                }, {});
                if (t1_from.w) {
                  data.t1_from = t1_from;
                }
                const t2_from = bracket.reduce((obj, b) => {
                  if (b.round === round - 1) {
                    if (b.winner === manager2.sleeper.id) {
                      obj.w = b.matchup;
                      return obj;
                    }
                  }
                  return obj;
                }, {});
                if (t2_from.w) {
                  data.t2_from = t2_from;
                }
              }

            // finals week
            } else if (($weeks.length === 3 && i === 2) || i === 1) {
              data.p = parseInt($matchup.find('h5').text()) || 1; // e.g. 7th place game becomes 7, 'championship' is 1

              // only first matchup is the bowl
              if (k === 0) {
                const t1_from = bracket.reduce((obj, b) => {
                  if (b.round === round - 1) {
                    if (b.winner === manager1.sleeper.id) {
                      obj.w = b.matchup;
                      return obj;
                    }
                  }
                  return obj;
                }, {});
                if (t1_from.w) {
                  data.t1_from = t1_from;
                }
                const t2_from = bracket.reduce((obj, b) => {
                  if (b.round === round - 1) {
                    if (b.winner === manager2.sleeper.id) {
                      obj.w = b.matchup;
                      return obj;
                    }
                  }
                  return obj;
                }, {});
                if (t2_from.w) {
                  data.t2_from = t2_from;
                }
              } else {
                // losers
                const t1_from = bracket.reduce((obj, b) => {
                  if (b.round === round - 2) {
                    if (b.loser === manager1.sleeper.id) {
                      obj.l = b.matchup;
                      return obj;
                    }
                  }
                  if (b.round === round - 1) {
                    if (b.loser === manager1.sleeper.id) {
                      obj.l = b.matchup;
                      return obj;
                    }
                  }
                  return obj;
                }, {});
                if (t1_from.l) {
                  data.t1_from = t1_from;
                }
                const t2_from = bracket.reduce((obj, b) => {
                  if (b.round === round - 2) {
                    if (b.loser === manager2.sleeper.id) {
                      obj.l = b.matchup;
                      return obj;
                    }
                  }
                  if (b.round === round - 1) {
                    if (b.loser === manager2.sleeper.id) {
                      obj.l = b.matchup;
                      return obj;
                    }
                  }
                  return obj;
                }, {});
                if (t2_from.l) {
                  data.t2_from = t2_from;
                }
              }
            }
          }
  
          bracket.push(data);
        }

      });
    });

    fs.writeFileSync(`./raw_data/${year}/${fileName}.json`, JSON.stringify(bracket, null, 2), 'utf-8', (err) => {
      if (err) throw err;
    })
    console.log(`${year} ${bracketType} bracket written to ./raw_data/${year}/${fileName}.json`);
    resolve(bracket);
  });

});

// parseBracket(2014);
// parseBracket(2014, true);

const buildDraft = (year) => new Promise((resolve) => {
  const orderMap = {
    2012: [ 'jay', 'fin', 'jimmie', 'dix', 'thd', 'hadkiss', 'rich', 'kitch', 'karsten', 'ant' ],
    2013: [ 'brock', 'rich', 'jay', 'thd', 'ant', 'dix', 'hadkiss', 'kitch', 'htc', 'fin' ],
    2014: [ 'htc', 'ant', 'thd', 'kitch', 'jay', 'hadkiss', 'fin', 'dix', 'brock', 'sol', 'chris', 'rich' ],
    2015: [ 'kitch', 'jay', 'rich', 'hadkiss', 'brock', 'thd', 'ant', 'htc', 'fin', 'chris', 'dix', 'sol' ],
    2016: [ 'sol', 'ant', 'htc', 'dix', 'jay', 'thd', 'fin', 'phil', 'rich', 'kitch', 'chris', 'htc' ],
    2017: [ 'hadkiss', 'sol', 'kitch', 'htc', 'dix', 'jay', 'fin', 'nick', 'chris', 'rich', 'ant', 'thd'],
    2018: [ 'jay', 'sol', 'ant', 'chris', 'nick', 'fin', 'hadkiss', 'thd', 'dix', 'rich', 'kitch', 'htc']
  };

  const draft = {
    draft_order: orderMap[year].map((id) => {
      return managers.find((m) => m.id === id).sleeper.id;
    }),
  }

  fs.writeFileSync(`./raw_data/${year}/draft.json`, JSON.stringify(draft, null, 2), 'utf-8', (err) => {
    if (err) throw err;
  });
  console.log(`${year} draft order written to ./raw_data/${year}/draft.json`);

  resolve(draft);
});

// buildDraft(2012);

const buildRawDataForYear = (year) => {
  const promises = [
    parseSettings(year),
    parseUsers(year),
    parseRosters(year),
    buildDraft(year),
    parsePicks(year),
    parseBracket(year), // championship
    parseBracket(year, true), // consolation
  ];

  for (let i = 1; i <= 16; i++) {
    promises.push(parseWeek(year, i));
  }

  Promise.all(promises).then(() => {
    console.log(`Built raw data for ${year} in ./raw_data/${year}`);
  })
}

// buildRawDataForYear(2019);

parseRosters(2012);
