const EndPoints = {
  NFL: {
    teams: 'http://site.api.espn.com/apis/site/v2/sports/football/nfl/teams',
    calendar:
      'https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/calendar/whitelist',
    games:
      'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?limit=1000&dates=20220908-20230112',
  },
  NCAA: {
    teams:
      'http://site.api.espn.com/apis/site/v2/sports/football/college-football/teams?limit=1000',
    calendar:
      'https://sports.core.api.espn.com/v2/sports/football/leagues/college-football/calendar/whitelist',
    games:
      'https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard?limit=1000&dates=20220801-20221231',
  },
}

//****************** ERROR CATCH??? **************** */

const getNFLTeams = async () => {
  const resp = await fetch(EndPoints.NFL.teams)
  const data = await resp.json()
  console.log('NFL ENDPOINT - Teams', data)
  return data.sports[0].leagues[0].teams
}

const getNflCalendar = async () => {
  const resp = await fetch(EndPoints.NFL.calendar)
  const data = await resp.json()
  console.log('NFL ENDPOINT - Calendar', data)
  return data
}

const getNFLGames = async () => {
  const resp = await fetch(EndPoints.NFL.games)
  const data = await resp.json()
  console.log('NFL ENDPOINT - Games', data)

  return data.events.map((game) => {
    const { id, date, status, shortName: name, week, competitions } = game
    const [homeTeam, awayTeam] = competitions[0].competitors
    return {
      id,
      date,
      time: status.type.shortDetail,
      status: status.type.description,
      name,
      week: week.number,
      // favorite: ...,
      // line: ...,
      // total: ...,
      // ----------
      // homeTeamRank: ...,
      homeTeamLogo: homeTeam.team.logo,
      homeTeamName: homeTeam.team.abbreviation,
      homeTeamRecord: homeTeam.records[0].summary,
      homeTeamScore: homeTeam.score,
      homeTeamWin: homeTeam.winner,
      // ----------
      // homeTeamRank:
      awayTeamLogo: awayTeam.team.logo,
      awayTeamName: awayTeam.team.abbreviation,
      awayTeamRecord: awayTeam.records[0].summary,
      awayTeamScore: awayTeam.score,
      awayTeamWin: awayTeam.winner,
    }
  })
}

const weekNav = () => {
  NFLdata.calendar.sections.entries[1].forEach((week) => {
    const weekNav = `<div class="week-nav">${week.value}</div>`
    getElementById('WeeklyScoreNav').append(weekNav)
  })
}

const loadNflGames = (calendarData, gameData) => {
  const scores = document.getElementById('Scores')

  // insert weeks...
  calendarData.sections[1].entries.forEach((week) => {
    const weekNav = document.createElement('div')
    weekNav.setAttribute('class', 'week-nav')
    weekNav.innerHTML = week.value
    document.getElementById('WeeklyScoreNav').append(weekNav)

    const gameWeek = document.createElement('div')
    gameWeek.setAttribute('id', `nflWeek${week.value}`)
    const weekLabel = `<div class="game-week">${week.label}</div>`
    gameWeek.innerHTML = weekLabel

    // insert days...
    const gameDays = calendarData.eventDate.dates.filter(
      (gameDay) => gameDay >= week.startDate && gameDay <= week.endDate
    )

    gameDays.forEach((day, index) => {
      const gameDay = document.createElement('div')
      gameDay.setAttribute('id', `nflDay${week.value}-${index}`)

      const dayLabel = `<div class="gameday-label">${dayjs(day)
        .format('dddd, MMMM D, YYYY')
        .toUpperCase()}</div>`
      gameDay.innerHTML = dayLabel

      const gamePods = document.createElement('div')
      gamePods.setAttribute('id', `gamePods${week.value}-${index}`)
      gamePods.setAttribute('class', 'game-pods')

      gameDay.append(gamePods)
      gameWeek.append(gameDay)

      // insert games...
      const games = gameData.filter((game) => {
        return game.date.split('T')[0] === day.split('T')[0]
      })

      games.forEach((game) => {
        const gamePod = document.createElement('div')
        gamePod.setAttribute('id', `${game.id}`)
        gamePod.classList.add('game-pod')

        const gameDetail = `
          <div class="time">${game.time}</div>
          <table>
            <tr class="game-head">
              <td class="rank"></td>
              <td class="logo"></td>
              <td class="name"></td>
              <th class="score"></th>
              <th class="spacer"></th>
              <th class="spread">Line</th>
              <th class="total">Total</th>
            </tr>
            <tr class="away">
              <td class="rank">-</td>
              <td class="logo"><img src="${game.awayTeamLogo}"></td>
              <td class="name">${game.awayTeamName}</td>
              <td class="score">${game.awayTeamScore}</td>
              <td class="spacer"></td>
              <td class="odds spread">${'+22.2'}</td>
              <td class="odds total">o${'22.2'}</td>
            </tr>
            <tr class="home">
              <td class="rank">-</td>
              <td class="logo"><img src="${game.homeTeamLogo}"></td>
              <td class="name">${game.homeTeamName}</td>
              <td class="score">${game.homeTeamScore}</td>
              <td class="spacer"></td>
              <td class="odds spread">${'-##.#'}</td>
              <td class="odds total">u${'##.#'}</td>
            </tr>
          </table>
        `
        gamePod.innerHTML = gameDetail
        gamePods.append(gamePod)
        gamePod.querySelector('.away').dataset.winner = game.awayTeamWin
        gamePod.querySelector('.home').dataset.winner = game.homeTeamWin
      })
    })

    scores.append(gameWeek)
  })
}

const constructScores = async () => {
  const NFLdata = {}
  NFLdata.teams = await getNFLTeams()
  NFLdata.calendar = await getNflCalendar()
  NFLdata.games = await getNFLGames()
  console.log('NFLdata', NFLdata)
  loadNflGames(NFLdata.calendar, NFLdata.games)
}

constructScores()
