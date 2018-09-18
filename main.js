document.body.onload = render

const dimension = 5
let boxes = []

for (let i = 0; i < dimension; i++) {
  boxes.push([])
  for (let j = 0; j < dimension; j++) {
    let numbering = (i * dimension) + (j + 1)
    let condition = ''
    if (numbering === 1) {
      condition = 'start'
    } else if (numbering === (dimension * dimension)) {
      condition = 'finish'
    }
    boxes[i].push({ condition })
  }
}

let turn = 'p1'
let turnCount = 0

let playerPosition = {
  p1: 'box-1',
  p2: 'box-1'
}

let playerName = {
  p1: 'Player 1',
  p2: 'Player 2'
}

let conditionValue = {
  snake: [],
  ladder: []
}

let diceValue = 1

const board = document.querySelector("#board")
const dice = document.querySelector("#dice")
const cheat = document.querySelector("#cheat")
const setConditionBtn = document.querySelector('#setCondition')

function setConditions () {
  // set ular / tangga

  let condition = prompt("Masukkan format 'asal, tujuan. Contoh : 5,12'")

  if (condition) {
    let origin = Number(condition.split(',')[0])
    let target = Number(condition.split(',')[1])
    let type = origin > target ? 'snake' : 'ladder'

    if ((origin <= 1 || origin >= dimension * dimension) || target <= 1 || target >= dimension * dimension) {
      console.log(origin)
      alert(`Hanya bisa set fungsi diantara box 2 hingga ${(dimension * dimension) - 1}`)
    } else {
      let boxFrom = document.querySelector(`#box-${origin}`).getAttribute('coordinate')
      let boxTo = document.querySelector(`#box-${target}`).getAttribute('coordinate')

      let coorFrom = boxFrom.split(',')
      let coorTo = boxTo.split(',')

      let currentBoxFrom = boxes[ coorFrom[0] ][ coorFrom[1] ].condition
      // let currentBoxTo = boxes[ coorTo[0] ][ coorTo[1] ].condition
      if (!currentBoxFrom.split(' ').includes('to')) {
        conditionValue[type].push({
          text: `${origin}->${target}`,
          coordinate: {
            from: boxFrom,
            to: boxTo
          }
        })
        boxes[ coorFrom[0] ][ coorFrom[1] ].condition = `${type} to ${target}`
        boxes[ coorTo[0] ][ coorTo[1] ].condition = `${type} from ${origin}`
      } else {
        alert(`Terdapat fungsi pada box no ${origin}`)
      }
      render()
    }
  }
}

function render () {
  checkWin()

  board.innerHTML = ""
  dice.innerHTML = ""

  if (turnCount > 0) {
    setConditionBtn.remove()
  }

  // render dice -- start --
  dice.innerText = diceValue
  dice.addEventListener("click", rollDice)
  // render dice -- end --
  
  // render board -- start --
  boxes.map(( row, rowIndex) => {
    let newRow = document.createElement("div")
    let isOdd = Math.abs(rowIndex%2) === 1
    newRow.className = "row"
    newRow.id = `row-${rowIndex}`
    if (isOdd) {
      newRow.className = `${newRow.className} reverse`
    }

    row.map(( box, boxIndex ) => {
      let newBox = document.createElement("div")
      let numbering = (rowIndex * dimension) + (boxIndex + 1)
      let numberBox = document.createElement("span")
      let playerPositionBox = document.createElement("span")
      let conditionBox = document.createElement("span")

      newBox.className = "box"
      newBox.id = `box-${numbering}`
      newBox.setAttribute("coordinate", `${rowIndex},${boxIndex}`)
      
      // render numbering
      numberBox.innerText = numbering
      numberBox.className = "numbering"
      
      // render player position
      playerPositionBox.className = "player-position"
      Object.keys(playerPosition).map(( player ) => {
        let newPlayer = document.createElement("span")
        newPlayer.className = `player ${player}`
        newPlayer.innerText = player
        if (newBox.id === playerPosition[player]) {
          playerPositionBox.appendChild(newPlayer)
        }
      })

      // render condition
      conditionBox.innerText = box.condition
      if (String(box.condition).includes('from')) {
        conditionBox.innerText = ""
      }
      conditionBox.className = `${box.condition.split(' ')[0]}`

      newBox.appendChild(numberBox)
      newBox.appendChild(playerPositionBox)
      newBox.appendChild(conditionBox)
      newRow.appendChild(newBox)
    })
    board.appendChild(newRow)
  })
  // render board -- end --

}

const rollDice = function (event, value = 0) {
  let newValue = value

  if (newValue === 0) {
    newValue = Math.floor( Math.random() * 6 ) + 1
  }
  turnCount++
  
  diceValue = newValue
  dice.disabled = true
  changePlayerPosition(turn)
  render()
}

const changePlayerPosition = function (player, newposition = null) {
  let oldPosition = Number(playerPosition[player].split('-')[1])
  let newPosition = newposition
  if (newPosition === null) {
    newPosition = oldPosition + diceValue
  }
  let isBackward = false

  if (newPosition < oldPosition) {
    isBackward = true
  }

  let animate = setInterval( () => {
    if (oldPosition === newPosition) {

      if (player === 'p1') {
        if (playerPosition.p2 !== 'box-25') {
          turn = 'p2'
        }
      } else {
        if (playerPosition.p1 !== 'box-25') {
          turn = 'p1'
        }
      }

      dice.disabled = false
      render()
      clearInterval(animate)
      checkConditionInPlace(player)
    } else {
      if (isBackward) {
        oldPosition--
      } else {
        oldPosition++
        if (oldPosition === 25) {
          isBackward = true
          newPosition = 25 - (newPosition%25)
        }
      }
      playerPosition[player] = `box-${oldPosition}`
      renderPlayerPosition(oldPosition, player)
    }
  }, 150)
}

const renderPlayerPosition = function (boxId = '', player) {
  const playerPositionBoxPrev = document.querySelector(`.player-position > .${player}`)
  if (playerPositionBoxPrev !== null) {
    playerPositionBoxPrev.remove()
  }

  const playerPositionBox = document.querySelector(`#box-${boxId} > .player-position`)
  let newPlayer = document.createElement("span")
  newPlayer.className = `player ${player}`
  newPlayer.innerText = player
  playerPositionBox.appendChild(newPlayer)
}

const checkConditionInPlace = function (player) {
  // change dice value
  Object.keys(conditionValue).map(( type ) => {
    conditionValue[type].map(( item ) => {
      let origin = Number(item.text.split('->')[0])
      let target = Number(item.text.split('->')[1])

      if (`box-${origin}` === playerPosition[player]) {
        dice.disabled = true
        changePlayerPosition(player, target)
      }
    })
  })
}

const checkWin = function () {
  let winner = null

  Object.keys(playerPosition).map(( player ) => {
    if (playerPosition[player] === 'box-25') {
      winner = playerName[player]
    }
  })

  if (winner !== null) {
    alert(`${winner} menang!!!`)
    window.location.reload()
  }
}
