import conflux from 'conflux'
import uuid from 'uuid'
import {EventEmitter} from 'events'
import {fill, find} from 'lodash'

const getDefaultState = () => {
  return {
    board: fill(new Array(9), -1)
  , move: 0
  , game: 0
  , playerTwoJoined: false
  , gameLosers: []
  }
}

const same = (a, b, c) => {
  return a === b && b === c && a !== -1
}

const gameOver = (b) => {
          // Rows
  return  same(b[0], b[1], b[2]) ||
          same(b[3], b[4], b[5]) ||
          same(b[6], b[7], b[8]) ||

          // Columns
          same(b[0], b[3], b[6]) ||
          same(b[1], b[4], b[7]) ||
          same(b[2], b[5], b[8]) ||

          // Diagonals
          same(b[0], b[4], b[8]) ||
          same(b[6], b[4], b[2])
}

class GameState extends EventEmitter {
  constructor (opts) {
    super()

    this._conflux = conflux({
      id: uuid.v4()
    , clusterSize: 2
    , electionTimeout: {min: 3000, max: 6000}
    , heartbeatInterval: 300
    , channel: {
        name: 'socket.io'
      , host: window.location.href.indexOf('herokuapp') > -1 ?
              'https://conflux-demos.herokuapp.com' :
              'http://localhost:' + (process.env.PORT || 8080)
      , channel: opts.room
      }
    , methods: {
        join: function () {
          const curState = this.getProvisionalState()

          if (curState.playerTwoJoined) {
            return new Error('Player two has already joined')
          }

          return {
            type: 'JOIN'
          }
        }
        // player: either 0 or 1
        // idx: the index of the cell to claim
      , claim: function (player, idx) {
          const curState = this.getProvisionalState()

          if (gameOver(curState.board)) {
            return new Error('The game is over, click "Forfeit" to reset the game')
          }

          if (curState.move % 2 !== player) {
            return new Error('It is not your turn!')
          }

          if (curState.board[idx] !== -1) {
            return new Error('That cell is already marked!')
          }

          return {
            type: 'CLAIM'
          , idx
          , player
          }
        }
      , forfeit: function (player) {
          const curState = this.getProvisionalState()

          if (curState.move % 2 !== player) {
            return new Error('It is not your turn!')
          }

          return {
            type: 'FORFEIT'
          , player: player
          }
        }
      , tie: function (player) {
          const curState = this.getProvisionalState()

          if (curState.move % 2 !== player) {
            return new Error('It is not your turn!')
          }

          if (gameOver(curState.board)) {
            return new Error('The game is over, click "Forfeit" to reset the game')
          }

          if (find(curState.board, p => p === -1) != null) {
            return new Error('Can\'t tie until all cells are filled!')
          }

          return {
            type: 'TIE'
          , player: player
          }
        }
      }
    , reduce: this.reducer
    })

    this._conflux.subscribe(() => {
      this.emit('change', this._conflux.getState())
    })
  }

  reducer (oldState = getDefaultState(), action) {

    if (action == null) {
      return oldState
    }

    const state = JSON.parse(JSON.stringify(oldState))

    switch (action.type) {
      case 'JOIN':
        state.playerTwoJoined = true
      break

      case 'CLAIM':
        state.board[action.idx] = action.player
        state.move = state.move + 1
      break

      case 'FORFEIT':
        state.board = fill(new Array(9), -1)
        state.move = 0
        state.game = state.game + 1
        state.gameLosers.push(action.player)
      break

      case 'TIE':
        state.board = fill(new Array(9), -1)
        state.move = 0
        state.game = state.game + 1
        state.gameLosers.push(-1)
      break

      default:
      return oldState
    }

    return state
  }

  claim (player, idx, cb) {
    this._conflux.perform('claim', [player, idx], 10000, cb)
  }

  forfeit (player, cb) {
    this._conflux.perform('forfeit', [player], 10000, cb)
  }

  tie (player, cb) {
    this._conflux.perform('tie', [player], 10000, cb)
  }

  join (cb) {
    this._conflux.perform('join', [], 10000, cb)
  }
}

export default GameState
export {getDefaultState, gameOver}
