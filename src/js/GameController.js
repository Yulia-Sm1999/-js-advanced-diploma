import PositionedCharacter from './PositionedCharacter';
import Bowman from './characters/Bowman';
import Daemon from './characters/Daemon';
import Magician from './characters/Magician';
import Swordsman from './characters/Swordsman';
import Undead from './characters/Undead';
import Vampire from './characters/Vampire';
import { generateTeam } from './generators';
import GamePlay from './GamePlay';
import cursors from './cursors';

export default class GameController {
  constructor (gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.positions = [];
    this.playerTypes = [Bowman, Swordsman, Magician];
    this.competitorTypes = [Daemon, Vampire, Undead];
  }

  init () {
    this.gamePlay.drawUi('arctic');
    const playerTeam = generateTeam(this.playerTypes, 3, 4);
    const competitorTeam = generateTeam(this.competitorTypes, 3, 4);

    const playerIndexes = [];
    for (let i = 0; i < this.gamePlay.boardSize ** 2; i += this.gamePlay.boardSize - 1) {
      playerIndexes.push(i);
      playerIndexes.push(++i);
    }

    const competitorIndexes = [];
    for (let i = this.gamePlay.boardSize - 2; i < this.gamePlay.boardSize ** 2 + 1; i += this.gamePlay.boardSize - 1) {
      competitorIndexes.push(i);
      competitorIndexes.push(++i);
    }

    playerTeam.characters.forEach((player) => {
      let position = playerIndexes[Math.floor(Math.random() * playerIndexes.length)];
      while (this.positions.some(obj => obj.position === position)) {
        position = playerIndexes[Math.floor(Math.random() * playerIndexes.length)];
      }
      this.positions.push(new PositionedCharacter(player, position));
    });

    competitorTeam.characters.forEach((competitor) => {
      let position = competitorIndexes[Math.floor(Math.random() * competitorIndexes.length)];
      while (this.positions.some(obj => obj.position === position)) {
        position = competitorIndexes[Math.floor(Math.random() * competitorIndexes.length)];
      }
      this.positions.push(new PositionedCharacter(competitor, position));
    });
    this.gamePlay.redrawPositions(this.positions);
    this.addEnterListener();
    this.addClickListener();
    this.addLeaveListener();
    // TODO: load saved stated from stateService
  }

  onCellClick (index) {
    const alreadyActive = this.gamePlay.cells.find(cell => cell.classList.contains('selected'));
    const characterInCell = this.positions.find(obj => obj.position === index);

    if (alreadyActive) {
      this.gamePlay.deselectCell(this.gamePlay.cells.indexOf(alreadyActive));
    }

    if (alreadyActive && !characterInCell) {
      const activePosition = this.gamePlay.cells.indexOf(alreadyActive);
      const position = this.positions.find(obj => obj.position === activePosition);
      position.position = index;
      this.gamePlay.redrawPositions(this.positions);
    }

    if (characterInCell && (this.playerTypes.some((type) => type.name === characterInCell.character.constructor.name))) {
      this.gamePlay.selectCell(index);
    }
    if (characterInCell && !alreadyActive && !(this.playerTypes.some((type) => type.name === characterInCell.character.constructor.name))) {
      GamePlay.showError('Сейчас Ваш ход');
    }
  }

  toMove (player) {
    const whereToMove = (step) => {
      const activePosition = this.gamePlay.cells.indexOf(player);
      const allowedPositions = [];
      for (let i = activePosition; (i > -1) && (i < this.gamePlay.boardSize - 1); i++) {
        allowedPositions.push(i);
      }
    };

    if (player === Bowman) {
      whereToMove(2);
    }
  }

  addClickListener () {
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
  }

  onCellEnter (index) {
    const characterInCell = this.positions.find(obj => obj.position === index);
    if (characterInCell) {
      const alreadyActive = this.gamePlay.cells.find(cell => cell.classList.contains('selected'));
      const playerChar = this.playerTypes.some((type) => type.name === characterInCell.character.constructor.name);
      if ((this.gamePlay.cells.indexOf(alreadyActive) !== characterInCell.position) && playerChar) {
        this.gamePlay.setCursor(cursors.pointer);
      }
    }
    if (characterInCell) {
      this.gamePlay.showCellTooltip(this.showCharacterInfo(characterInCell), index);
    }
  }

  showCharacterInfo (character) {
    const level = `\u{1F396} ${character.character.level} `;
    const defence = `\u2694 ${character.character.defence} `;
    const attack = `\u{1F6E1} ${character.character.attack} `;
    const health = `\u2764 ${character.character.health}`;
    return (level + defence + attack + health);
  };

  addEnterListener () {
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
  }

  onCellLeave (index) {
    this.gamePlay.hideCellTooltip(index);
    this.gamePlay.setCursor(cursors.auto);
    console.log('done');
  }

  addLeaveListener () {
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
  }
}
