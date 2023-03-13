import { generateTeam, characterGenerator } from '../js/generators';
import Character from '../js/Character';
import Daemon from '../js/characters/Daemon';
import Vampire from '../js/characters/Vampire';
import Undead from '../js/characters/Undead';
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
