import { Standing } from '../../models/standing';
import { createBracket } from '../matchmaking';

test('creates valid bracket', () => {
  const floaters = new Set(['1', '2']);
  const unmatched = new Set(['3', '4', '5']);
  const standings = new Map<string, Standing>();

  const dummyStandings = [
    ['1', 2, 0, 0],
    ['2', 2, 0, 0],
    ['3', 1, 1, 0],
    ['4', 1, 1, 0],
    ['5', 0, 0, 1],
  ];

  for (const [player, w, l, d] of dummyStandings) {
    standings.set(player as string, new Standing(
      player as string, null, w as number, l as number, d as number,
    ));
  }

  const bracket = createBracket(floaters, unmatched, standings);
  expect(bracket).toEqual(['1', '2', '3', '4']);
});
