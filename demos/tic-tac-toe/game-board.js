import React from 'react'

class GameBoard extends React.Component {

  render () {
    return <div styles={{width: 300, height: 300, border: '1px solid #000'}}>
      Hello there
    </div>
  }
}

GameBoard.defaultProps = {
  gameboard: new Array(9)
}

GameBoard.defaultProps = {
  gameboard: React.PropTypes.array.isRequired
}

export default GameBoard
