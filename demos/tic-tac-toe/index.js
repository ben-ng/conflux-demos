import React from 'react'
import ReactDOM from 'react-dom'
import GameBoard from './game-board'
import GameState, {getDefaultState} from './game-state'
import uuid from 'uuid'
import async from 'async'

const IDENT_LEN = 6

let room
let player

if (window.location.search != null && window.location.search.length === IDENT_LEN + 1) {
  room = window.location.search.substring(1)
  player = 1
}
else {
  room = uuid.v4().replace(/-/g, '').substring(0, IDENT_LEN)
  player = 0
}

const gameState = new GameState({room})

let lastStatusMessage = ''
let lastGameState = getDefaultState()

const rerender = function () {
  ReactDOM.render(
    <GameBoard statusText={lastStatusMessage}
                onForfeit={onForfeit}
                onCellClicked={onCellClicked}
                room={room}
                player={player} {...lastGameState} />,
    document.getElementById('demo')
  )
}

const showError = function (err) {
  if (err) {
    lastStatusMessage = err.toString()

    rerender()
  }
}

const onCellClicked = (idx) => {
  gameState.claim(player, idx, showError)
}

const onForfeit = (idx) => {
  gameState.forfeit(player, showError)
}

if (player === 1) {
  let fails = 0

  async.retry({times: 3, interval: 0}, function (next) {
    lastStatusMessage = 'Trying to connect...'
    rerender()

    gameState.join(function (err) {
      if (err != null) {
        if (err.message.indexOf('has already joined') > -1) {
          next()
        }
        else {
          fails = fails + 1
          lastStatusMessage = `Trying to connect... (retry #${fails})`
          rerender()
          next(err)
        }
      }
      else {
        next()
      }
    })
  }, function (err) {
    if (err) {
      lastStatusMessage = 'Something is wrong, please create an issue in GitHub!'
      rerender()
    }
    else {
      lastStatusMessage = 'Connected!'
      rerender()
    }
  })
}

// Initial render
rerender()

gameState.on('change', (state) => {
  lastGameState = state
  rerender()
})
