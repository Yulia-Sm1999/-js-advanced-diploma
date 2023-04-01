import { generateTeam, characterGenerator } from '../js/generators';
import Character from '../js/Character';
import Bowman from '../js/characters/Bowman';
import Daemon from '../js/characters/Daemon';
import Magician from '../js/characters/Magician';
import Swordsman from '../js/characters/Swordsman';
import Undead from '../js/characters/Undead';
import Vampire from '../js/characters/Vampire';
import GameController from '../js/GameController';
import GamePlay from '../js/GamePlay';
import GameStateService from '../js/GameStateService';

test('should throw an error if make new Character', () => {
  expect(() => new Character(2)).toThrow('Нельзя создавать персонажа с помощью класса Character');
});

test('should not throw an error while making characters not through new Character ', () => {
  expect(() => typeof (new Daemon(1)).toBe('object'));
});

test('1st level characters have all right characteristics', () => {
  expect(new Daemon(1)).toEqual({
    level: 1,
    type: 'daemon',
    attack: 10,
    health: 50,
    defence: 10
  });
});

test('should create unlimited quantity of characters', () => {
  const typesToCreate = [Daemon, Vampire, Undead];
  const charactersToCreate = characterGenerator(typesToCreate, 3);
  const createdCharacters = [];
  createdCharacters.push(charactersToCreate.next());
  createdCharacters.push(charactersToCreate.next());
  createdCharacters.push(charactersToCreate.next());
  createdCharacters.push(charactersToCreate.next());
  createdCharacters.push(charactersToCreate.next());
  expect(createdCharacters.length).toBe(5);
  createdCharacters.push(charactersToCreate.next());
  createdCharacters.push(charactersToCreate.next());
  createdCharacters.push(charactersToCreate.next());
  expect(createdCharacters.length).toBe(8);
});

test('should show the correct number of characters in team and in the correct range of levels', () => {
  const characters = [Daemon, Vampire, Undead];
  const team = generateTeam(characters, 4, 7);
  expect(team.characters.length).toBe(7);
  expect(team.characters.every(character => character.level <= 4)).toBe(true);
});

test('should show all characteristics when mouseover', () => {
  const gamePlay = new GamePlay();
  const stateService = new GameStateService({});
  const gameCtrl = new GameController(gamePlay, stateService);
  const character = new Daemon(3);
  expect(gameCtrl.showCharacterInfo({ character, position: 3 })).toBe('\u{1F396} 3 \u2694 10 \u{1F6E1} 10 \u2764 50');
});

test('should check is Bowman allowed to move and attack', () => {
  const gamePlay = new GamePlay();
  const stateService = new GameStateService({});
  const gameCtrl = new GameController(gamePlay, stateService);
  gamePlay.playerTypes = [Bowman, Swordsman, Magician];
  gamePlay.competitorTypes = [Daemon, Vampire, Undead];
  const bowman = { character: new Bowman(2), position: 45 };
  const magician = { character: new Magician(3), position: 46 };
  const swordsman = { character: new Swordsman(1), position: 55 };
  const daemon = { character: new Daemon(1), position: 14 };
  const undead = { character: new Undead(3), position: 18 };
  const vampire = { character: new Vampire(3), position: 47 };
  gameCtrl.positions = [bowman, magician, swordsman, daemon, undead, vampire];
  expect(gameCtrl.checkMovement(46, 45, bowman, () => 'allowed', () => 'not allowed')).toBe('not allowed');
  expect(gameCtrl.checkMovement(44, 45, bowman, () => 'allowed', () => 'not allowed')).toBe('allowed');
  expect(gameCtrl.checkAttack(47, 45, bowman, () => 'allowed', () => 'not allowed')).toBe('allowed');
  expect(gameCtrl.checkAttack(18, 45, bowman, () => 'allowed', () => 'not allowed')).toBe('not allowed');

  expect(gameCtrl.checkMovement(53, 46, magician, () => 'allowed', () => 'not allowed')).toBe('allowed');
  expect(gameCtrl.checkAttack(14, 46, magician, () => 'allowed', () => 'not allowed')).toBe('allowed');

  expect(gameCtrl.checkMovement(19, 55, swordsman, () => 'allowed', () => 'not allowed')).toBe('allowed');
  expect(gameCtrl.checkAttack(47, 55, swordsman, () => 'allowed', () => 'not allowed')).toBe('allowed');

  expect(gameCtrl.checkMovement(19, 14, daemon, () => 'allowed', () => 'not allowed')).toBe('not allowed');
  expect(gameCtrl.checkAttack(47, 14, daemon, () => 'allowed', () => 'not allowed')).toBe('not allowed');

  expect(gameCtrl.checkMovement(22, 18, undead, () => 'allowed', () => 'not allowed')).toBe('allowed');
  expect(gameCtrl.checkAttack(19, 18, undead, () => 'allowed', () => 'not allowed')).toBe('not allowed');

  expect(gameCtrl.checkMovement(61, 47, vampire, () => 'allowed', () => 'not allowed')).toBe('allowed');
  expect(gameCtrl.checkAttack(45, 47, vampire, () => 'allowed', () => 'not allowed')).toBe('allowed');
});
