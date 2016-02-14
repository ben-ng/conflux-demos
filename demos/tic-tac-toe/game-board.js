import React, {PropTypes} from 'react'
import {find, bind} from 'lodash'
import {gameOver} from './game-state'

class GameBoard extends React.Component {

  constructor () {
    super()

    this.state = {
      gameCode: ''
    }
  }

  onCellClicked (idx) {
    if (typeof this.props.onCellClicked === 'function') {
      this.props.onCellClicked(idx)
    }
  }

  onForfeit (idx) {
    if (typeof this.props.onForfeit === 'function') {
      this.props.onForfeit()
    }
  }

  onTie (idx) {
    if (typeof this.props.onTie === 'function') {
      this.props.onTie()
    }
  }

  onCodeChange (e) {
    this.setState({
      gameCode: e.target.value.toLowerCase()
    })
  }

  onNewGame () {
    window.location = `${window.location.href.match(/^[^?]+/)[0]}?0${this.props.room}`
  }

  onJoinGame () {
    window.location = `${window.location.href.match(/^[^?]+/)[0]}?1${this.state.gameCode}`
  }

  render () {

    const joinLink = `${window.location.href.match(/^[^?]+/)[0]}?1${this.props.room}`

    const cellStyle = {
      width: '100px'
    , height: '100px'
    , borderRight: '1px solid #000'
    , borderBottom: '1px solid #000'
    , float: 'left'
    , textAlign: 'center'
    , lineHeight: '98px'
    , fontSize: '98px'
    }

    const gridStyle = {
      width: '301px'
    , height: '301px'
    , borderTop: '1px solid #000'
    , borderLeft: '1px solid #000'
    }

    const grid = <div style={gridStyle}>
        {this.props.board.map((player, idx) => {
          let char

          switch (player) {
            case -1: char = ' '; break
            case 0: char = 'O'; break
            case 1: char = 'X'; break
          }

          return <div key={`cell-${idx}`}
              onClick={bind(this.onCellClicked, this, idx)}
              style={cellStyle}>{char}</div>
        })}
      </div>

    const joinStyle = {
      width: '300px'
    , height: '300px'
    , border: '1px solid #000'
    , padding: '1em'
    }

    const initialMsg = <div>
        <button onClick={bind(this.onNewGame, this)}>Start A New Game</button><br /><br />
        or<br /><br />
        Connect To Game: <input type="text"
                onChange={bind(this.onCodeChange, this)}
                value={this.state.gameCode}
                placeholder="6-character code"
                /><br /><br />
        {this.state.gameCode.match(/^[a-z0-9]{6}$/i) != null ?
          <button onClick={bind(this.onJoinGame, this)}>Join Game</button> :
          null
        }
      </div>
    const playerOneMsg = <div>
            <p>
              Join this game with this code:
              <pre style={{fontSize: '1.2em'}}>{this.props.room}</pre>
            </p>
            <p>
              You can also open this link in a new tab, or another device:<br />
              <a target="_blank" href={joinLink}>{joinLink}</a><br /><br />
              Send it to a friend!
            </p>
          </div>
    const playerTwoMsg = <div><p>Trying to join the game...</p></div>

    const joinMsg = <div style={joinStyle}>
        {this.props.player === -1 ?
          initialMsg :
          this.props.player === 0 ?
          playerOneMsg :
          playerTwoMsg}
      </div>

    return <div>
      <p>{this.props.statusText}</p>
      {this.props.playerTwoJoined ? grid: joinMsg}
      <div>
        <p>
          {this.props.move % 2 !== this.props.player || !gameOver(this.props.board) ?
            null :
            <button onClick={this.props.onForfeit}>Forfeit this game</button>}

          {this.props.move % 2 !== this.props.player || find(this.props.board, p => p === -1) != null || gameOver(this.props.board) ?
            null :
            <button onClick={this.props.onTie}>Declare a tie</button>}

          <br /><br />
          Turn: {this.props.move % 2 === this.props.player ? 'Yours' : 'Opponent\'s'}<br />
          Move: {this.props.move + 1}<br />
          Game: {this.props.game + 1}
          {this.props.gameLosers.length > 0 ? <div>
            Past winners:
            <ol>
              {this.props.gameLosers.map((loser, idx) => {
                return <li key={`game-${idx}`}>{loser === -1 ? 'Tie' : loser === this.props.player ? 'Opponent' : 'You'}</li>
              })}
            </ol>
          </div>: null}
        </p>
      </div>
    </div>
  }
}

GameBoard.propTypes = {
  board: PropTypes.arrayOf(PropTypes.number).isRequired
, move: PropTypes.number.isRequired
, game: PropTypes.number.isRequired
, playerTwoJoined: PropTypes.bool.isRequired
, gameLosers: PropTypes.arrayOf(PropTypes.number).isRequired
, room: PropTypes.string
, player: PropTypes.number.isRequired
, onCellClicked: PropTypes.func
, onForfeit: PropTypes.func
, onTie: PropTypes.func
, statusText: PropTypes.string
}

export default GameBoard
