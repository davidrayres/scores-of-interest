
// ESPN ENDPOINTS ==============================================

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

// GET DATA ====================================================

const getNFLTeams = async () => {
  //********** ERROR CATCH??? **************** */
  const resp = await fetch(EndPoints.NFL.teams)
  const data = await resp.json()
  console.log('NFL ENDPOINT - Teams', data)
  return data.sports[0].leagues[0].teams
}

// -------------------------------------------------------------

const getNflCalendar = async () => {
  const resp = await fetch(EndPoints.NFL.calendar)
  const data = await resp.json()
  console.log('NFL ENDPOINT - Calendar', data)
  return data
}

// -------------------------------------------------------------

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

// STAGE COMPONENTS ============================================
// =============================================================
// =============================================================

const loadWeekNav = (calendarData, weekNum) => {
  const weekBtnContainer = document.getElementById('WeekBtnContainer')

  calendarData.sections[1].entries.forEach((week) => {
    const weekNav = document.createElement('div')
    weekNav.setAttribute('class', 'week-btn')
    weekNav.innerHTML = week.value
    weekBtnContainer.append(weekNav)
  })

  weekBtnContainer.children.item(weekNum).classList.add('current')
}

// -------------------------------------------------------------

const loadNflGames = (calendarData, gameData, weekNum) => {
  const selectedWeek = calendarData.sections[1].entries[weekNum]
  const scoresContainer = document.getElementById('ScoresContainer')
  const existingScores = scoresContainer.querySelectorAll('div:not(#WeekLabel)')
  const weekLabel = document.getElementById('WeekLabel')

  // remove existing scores...
  existingScores.forEach(x => x.remove())

  //set week label...
  weekLabel.innerHTML = `WEEK ${weekNum + 1}`

  //filter calendar data to current week...
  const gameDays = calendarData.eventDate.dates.filter(
    (date) => date >= selectedWeek.startDate && date <= selectedWeek.endDate
  )
  console.log(gameDays)
  // construct containers for each day .............................
  gameDays.forEach((day, index) => {
    //construct game day container...
    const gameDayContainer = document.createElement('div')
    gameDayContainer.setAttribute('id', `nflDay${selectedWeek.value}-${index}`)

    //construct date label and insert into gameday container...
    const gameDayLabel = document.createElement('div')
    gameDayLabel.setAttribute('class', 'date-label')
    gameDayLabel.innerHTML = dayjs(day)
      .format('dddd, MMMM D, YYYY')
      .toUpperCase()
    gameDayContainer.append(gameDayLabel)

    //construct gamepod container and insert into gameday container...
    const gamePodsContainer = document.createElement('div')
    gamePodsContainer.setAttribute('id', `gamePodsContainer${index}`)
    gamePodsContainer.setAttribute('class', 'game-pods')

    // insert games...
    // filter game data to current week...
    // ########## figure out how to pick thursdays...given GMT timezone
    const games = gameData.filter((game) => {
      return game.date.split('T')[0] === day.split('T')[0]
    })

    games.forEach((game) => {
      //construct game pod...
      const gamePod = document.createElement('div')
      gamePod.setAttribute('id', `${game.id}`)
      gamePod.classList.add('game-pod')

      //construct game detail...
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

      //insert each game detail into gamePod and each gamePod into gamepod container...
      gamePod.innerHTML = gameDetail
      gamePod.querySelector('.away').dataset.winner = game.awayTeamWin
      gamePod.querySelector('.home').dataset.winner = game.homeTeamWin
      gamePodsContainer.append(gamePod)
    })

    //insert gamepod container into gameday container, then insert gameday container into scores container...
    gameDayContainer.append(gamePodsContainer)
    scoresContainer.append(gameDayContainer)
  })
}

// CONSTRUCT PAGE ==============================================
// =============================================================
// =============================================================

const constructScores = async () => {
  const NFLdata = {}
  let weekNum = 0

  NFLdata.teams = await getNFLTeams()
  NFLdata.calendar = await getNflCalendar()
  NFLdata.games = await getNFLGames()
  console.log('NFLdata', NFLdata)

  loadWeekNav(NFLdata.calendar, weekNum)
  loadNflGames(NFLdata.calendar, NFLdata.games, weekNum)

  const weekButtons = document.querySelectorAll('.week-btn')

  weekButtons.forEach((button) => {
    button.addEventListener('click', (e) => {
      weekNum = parseInt(e.target.innerText) - 1
      document
        .querySelector('#WeekBtnContainer .current')
        .classList.remove('current')
      button.classList.add('current')

      loadNflGames(NFLdata.calendar, NFLdata.games, weekNum)
    })
  })
}

constructScores()
