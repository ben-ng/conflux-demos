import React, {PropTypes} from 'react'
import {bind} from 'lodash'

class GameBoard extends React.Component {

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

  render () {

    const joinLink = `${window.location.href.match(/^[^?]+/)[0]}?${this.props.room}`

    const cellStyle = {
      width: '99px'
    , height: '99px'
    , borderRight: '1px solid #000'
    , borderBottom: '1px solid #000'
    , float: 'left'
    , textAlign: 'center'
    , lineHeight: '98px'
    , fontSize: '98px'
    }

    const gridStyle = {
      width: '300px'
    , height: '300px'
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

    const joinMsg = <div style={joinStyle}>
        {this.props.player === 0 ? <div>
          <p>Join this game by opening this link on another device, or in a new tab:</p>
          <p><a target="_blank" href={joinLink}>{joinLink}</a></p>
        </div> : <div><p>Trying to join the game...</p></div>}
      </div>

    return <div>
      <p>{this.props.statusText}</p>
      {this.props.playerTwoJoined ? grid: joinMsg}
      <div>
        <p>
          <button onClick={this.props.onForfeit}>Forfeit</button><br /><br />
          Turn: {this.props.move % 2 === this.props.player ? 'Yours' : 'Opponent\'s'}<br />
          Move: {this.props.move + 1}<br />
          Game: {this.props.game + 1}
          {this.props.gameLosers.length > 0 ? <div>
            Past winners:
            <ol>
              {this.props.gameLosers.map((loser, idx) => {
                return <li key={`game-${idx}`}>{loser === this.props.player ? 'Opponent' : 'You'}</li>
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
, room: PropTypes.string.isRequired
, player: PropTypes.number.isRequired
, onCellClicked: PropTypes.func
, onForfeit: PropTypes.func
, statusText: PropTypes.string
}

export default GameBoard
