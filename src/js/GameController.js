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
    const alreadyActive = this.gamePlay.cells.find(cell => cell.classList.contains('selected-yellow'));
    const characterInCell = this.positions.find(obj => obj.position === index);
    const activePosition = this.gamePlay.cells.indexOf(alreadyActive);
    const activeCharacter = this.positions.find(obj => obj.position === activePosition);

    if (alreadyActive) {
      this.gamePlay.deselectCell(this.gamePlay.cells.indexOf(alreadyActive));
    }

    if (alreadyActive && characterInCell) {
      const isCompetotorInCell = this.competitorTypes.some(player => player.name === characterInCell.character.constructor.name);
      if (isCompetotorInCell) {
        const doDamage = () => {
          const damage = Math.max(activeCharacter.character.attack - characterInCell.character.defence, activeCharacter.character.attack * 0.1);
          const showDamage = this.gamePlay.showDamage(index, damage);
          showDamage.then(() => {
            characterInCell.character.health -= damage;
            this.gamePlay.cells[index].classList.remove('selected-red');
            this.gamePlay.setCursor(cursors.auto);

            if (characterInCell.character.health < 1) {
              const elToDelete = this.positions.indexOf(characterInCell);
              this.positions.splice(elToDelete, 1);
            }
            this.gamePlay.redrawPositions(this.positions);
            if (!this.positions.some((el) => this.competitorTypes.some((type) => type.name === el.character.constructor.name))) {
              this.positions.forEach((el) => {
                const attackAfter = Math.max(el.character.attack, el.character.attack * (80 + el.character.health) / 100);
                el.character.attack = attackAfter;

                const defenceAfter = Math.max(el.character.defence, el.character.defence * (80 + el.character.health) / 100);
                el.character.defence = defenceAfter;

                el.character.health += 80;
                if (el.character.health > 100) {
                  el.character.health = 100;
                };
              });
            }
          });
        };
        this.checkAttack(index, activePosition, activeCharacter, doDamage, () => alert('Противник вне зоны Вашей атаки!'));
      }
    };

    if (alreadyActive && !characterInCell) {
      const moveCharacter = () => {
        activeCharacter.position = index;
        this.gamePlay.redrawPositions(this.positions);
        this.gamePlay.deselectCell(index);
      };

      this.checkMovement(index, activePosition, activeCharacter, moveCharacter, () => alert('Сюда нельзя сделать ход!'));
    };

    if (characterInCell && (this.playerTypes.some((type) => type.name === characterInCell.character.constructor.name))) {
      this.gamePlay.selectCell(index);
    };

    if (characterInCell && !alreadyActive && !(this.playerTypes.some((type) => type.name === characterInCell.character.constructor.name))) {
      GamePlay.showError('Сейчас Ваш ход');
    };
  }

  toMove (idCursor, idActive, size = this.gamePlay.boardSize) {
    let result;
    const diff = Math.abs(idCursor - idActive);
    const mod = idCursor % size;
    const diagDiffKoef = Math.abs(
      Math.floor(idCursor / size) - Math.floor(idActive / size)
    );
    // vertical
    if (mod - (idActive % size) === 0) {
      result = diff / size;
    }
    // horisontal
    if (Math.floor(idCursor / size) === Math.floor(idActive / size)) {
      result = diff;
    }
    // left diagonal
    if (diff === (size - 1) * diagDiffKoef) {
      result = diff / (size - 1);
    }
    // right diagonal
    if (diff === (size + 1) * diagDiffKoef) {
      result = diff / (size + 1);
    }
    return result;
  }

  checkMovement (index, activePosition, activeCharacter, func, errorFunc) {
    const isAllowedToMove = this.toMove(index, activePosition);
    const isEmptyCell = this.positions.find(obj => obj.position === index);
    const activeType = activeCharacter.character.type;
    if (isAllowedToMove) {
      if (((activeType === 'swordsman') || (activeType === 'undead')) && (isAllowedToMove < 5) && (isEmptyCell === undefined)) {
        return func();
      };

      if (((activeType === 'bowman') || (activeType === 'vampire')) && (isAllowedToMove < 3) && (isEmptyCell === undefined)) {
        return func();
      };

      if (((activeType === 'magician') || (activeType === 'daemon')) && (isAllowedToMove < 2) && (isEmptyCell === undefined)) {
        return func();
      }
    }
    return errorFunc();
  }

  checkAttack (index, activePosition, activeCharacter, func, errorFunc) {
    const isAllowedToAttack = this.toMove(index, activePosition);
    const isEmptyCell = this.positions.find(obj => obj.position === index);
    const activeType = activeCharacter.character.type;
    if (isAllowedToAttack) {
      if (((activeType === 'swordsman') || (activeType === 'undead')) && (isAllowedToAttack < 2) && (isEmptyCell !== undefined)) {
        return func();
      };

      if (((activeType === 'bowman') || (activeType === 'vampire')) && (isAllowedToAttack < 3) && (isEmptyCell !== undefined)) {
        return func();
      };

      if (((activeType === 'magician') || (activeType === 'daemon')) && (isAllowedToAttack < 5) && (isEmptyCell !== undefined)) {
        return func();
      }
    }
    return errorFunc();
  }

  addClickListener () {
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
  }

  onCellEnter (index) {
    const characterInCell = this.positions.find(obj => obj.position === index);
    const alreadyActive = this.gamePlay.cells.find(cell => cell.classList.contains('selected-yellow'));
    const activePosition = this.gamePlay.cells.indexOf(alreadyActive);
    const activeCharacter = this.positions.find(obj => obj.position === activePosition);

    if (characterInCell) {
      this.gamePlay.showCellTooltip(this.showCharacterInfo(characterInCell), index);

      const playerChar = this.playerTypes.some((type) => type.name === characterInCell.character.constructor.name);
      if ((this.gamePlay.cells.indexOf(alreadyActive) !== characterInCell.position) && playerChar) {
        this.gamePlay.setCursor(cursors.pointer);
      }
    };

    if (alreadyActive) {
      const highlightGreenCell = () => {
        const alreadyHighlighted = this.gamePlay.cells.indexOf(this.gamePlay.cells.find(cell => cell.classList.contains('selected-green')));
        if (alreadyHighlighted > -1) {
          this.gamePlay.deselectCell(alreadyHighlighted);
        }
        this.gamePlay.selectCell(this.gamePlay.cells.indexOf(this.gamePlay.cells[index]), 'green');
        this.gamePlay.setCursor(cursors.pointer);
      };

      this.checkMovement(index, activePosition, activeCharacter, highlightGreenCell, () => this.gamePlay.setCursor(cursors.notallowed));

      if (characterInCell) {
        if (this.playerTypes.some((type) => type.name === characterInCell.character.constructor.name)) {
          this.gamePlay.setCursor(cursors.pointer);
        };

        const isCompetotorInCell = this.competitorTypes.some(player => player.name === characterInCell.character.constructor.name);
        if (isCompetotorInCell) {
          const highlightRedCell = () => {
            const alreadyHighlighted = this.gamePlay.cells.indexOf(this.gamePlay.cells.find(cell => cell.classList.contains('selected-red')));
            if (alreadyHighlighted > -1) {
              this.gamePlay.deselectCell(alreadyHighlighted);
            }
            this.gamePlay.selectCell(this.gamePlay.cells.indexOf(this.gamePlay.cells[index]), 'red');
            this.gamePlay.setCursor(cursors.crosshair);
          };
          this.checkAttack(index, activePosition, activeCharacter, highlightRedCell, () => this.gamePlay.setCursor(cursors.notallowed));
        }
      }
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
    if (!this.gamePlay.cells[index].classList.contains('selected-yellow')) {
      this.gamePlay.deselectCell(this.gamePlay.cells.indexOf(this.gamePlay.cells[index]));
    }
  }

  addLeaveListener () {
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
  }
}
