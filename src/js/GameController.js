import PositionedCharacter from './PositionedCharacter'
import Bowman from './characters/Bowman'
import Daemon from './characters/Daemon'
import Magician from './characters/Magician'
import Swordsman from '././characters/Swordsman'
import Undead from '././characters/Undead'
import Vampire from '././characters/Vampire'
import { generateTeam } from './generators'

export default class GameController {
  constructor (gamePlay, stateService) {
    this.gamePlay = gamePlay
    this.stateService = stateService
  }

  init () {
    this.gamePlay.drawUi('prairie')
    const playerTypes = [Bowman, Swordsman, Magician]
    const competitorTypes = [Daemon, Vampire, Undead]
    const playerTeam = generateTeam(playerTypes, 3, 4)
    const competitorTeam = generateTeam(competitorTypes, 3, 4)
    const positions = []
    const randomPlayerIndex = [0, 8, 16, 24, 32, 40, 48, 56]
    const randomCompetitorIndex = [7, 15, 23, 31, 39, 47, 63]

    playerTeam.characters.forEach((player) => {
      let position = randomPlayerIndex[Math.floor(Math.random() * randomPlayerIndex.length)]
      while (positions.some(obj => obj.position === position)) {
        position = randomPlayerIndex[Math.floor(Math.random() * randomPlayerIndex.length)]
      }
      positions.push(new PositionedCharacter(player, position))
    })

    competitorTeam.characters.forEach((competitor) => {
      let position = randomCompetitorIndex[Math.floor(Math.random() * randomCompetitorIndex.length)]
      while (positions.some(obj => obj.position === position)) {
        position = randomCompetitorIndex[Math.floor(Math.random() * randomCompetitorIndex.length)]
      }
      positions.push(new PositionedCharacter(competitor, position))
    })
    this.gamePlay.redrawPositions(positions)
    // this.gamePlay.redrawPositions([new PositionedCharacter(new Bowman(2), 1), new PositionedCharacter(new Daemon(2), 3)])
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
  }

  onCellClick (index) {
    // TODO: react to click
  }

  onCellEnter (index) {
    // if (!this.gamePlay.cells[index].classList.contains('cell')) {
    //   this.gamePlay.showCellTooltip(`U+1F396 1 U+2694 10 U+1F6E1 40 U+2764 50`, index)
    // }
  }

  onCellLeave (index) {
    this.gamePlay.hideCellTooltip(index)
  }

  addCellEnterListener () {
    this.gamePlay.addCellEnterListener(this.onCellEnter)
  }
}
