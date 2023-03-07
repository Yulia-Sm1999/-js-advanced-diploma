import { calcTileType } from '../js/utils.js'

test('should return string according to index', () => {
  expect(calcTileType(6, 8)).toBe('top')
  expect(calcTileType(8, 8)).toBe('left')
  expect(calcTileType(15, 8)).toBe('right')
  expect(calcTileType(56, 8)).toBe('bottom-left')
  expect(calcTileType(0, 8)).toBe('top-left')
  expect(calcTileType(7, 8)).toBe('top-right')
  expect(calcTileType(63, 8)).toBe('bottom-right')
  expect(calcTileType(25, 8)).toBe('center')
  expect(calcTileType(59, 8)).toBe('bottom')
})
