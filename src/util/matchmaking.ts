import * as _ from 'lodash';
import { Match } from '../models/match';
import { Standing } from '../models/standing';
import { Tourney } from '../models/tourney';

function createBracket(floaters: Set<string>, unmatched: Set<string>, standings: Map<string, Standing>): string[] {
  // Collect all players with max points
  let maxPoints = 0;
  let playersWithMax: string[] = [];

  for (const player of unmatched.values()) {
    const points = standings.get(player)!.points;

    if (points === maxPoints) {
      playersWithMax.push(player);
    } else if (points > maxPoints) {
      maxPoints = points;
      playersWithMax = [player];
    }
  }

  return [...floaters, ...playersWithMax];
}

function canMatchPlayers(p1: string, p2: string, tourney: Tourney): boolean {
  for (const round of tourney.rounds) {
    for (const match of round) {
      if (match.p1 === p1 && match.p2 === p2 || match.p1 === p2 && match.p2 === p1) {
        return false;
      }
    }
  }
  return true;
}

function matchPlayersWithinBracket(
  bracket: string[],
  bracketMatchedPlayers: Set<string>,
  bracketMatches: Match[],
  tourney: Tourney,
  randomizeSecondPlayer: boolean,
  ): void {
  for (const p1 of bracket) {
    if (bracketMatchedPlayers.has(p1)) {
      continue;
    }

    let secondPlayerPool = bracket.filter(p2 => p2 !== p1 && !bracketMatchedPlayers.has(p2));

    // If if we failed to match using optimal top down pairing, fallback to
    // randomly determining an opponent from the same bracket
    if (randomizeSecondPlayer) {
      console.log('Randomizing second player');
      secondPlayerPool = _.shuffle(secondPlayerPool);
    }

    for (const p2 of secondPlayerPool) {
      // If can match players, remove both from pool
      if (canMatchPlayers(p1, p2, tourney)) {
        bracketMatches.push(new Match(p1, p2));
        bracketMatchedPlayers.add(p1);
        bracketMatchedPlayers.add(p2);
        break;
      }
    }
  }
}

export function createRandomPairings(players: string[]): Match[] {
  players = _.shuffle(players);
  const matches = [];

  for (let i = 0; i < players.length; i += 2) {
    let match;
    if (i === players.length - 1) {
      // Grant bye to last remaining player
      match = new Match(players[i], null);
    } else {
      match = new Match(players[i], players[i + 1]);
    }
    matches.push(match);
  }

  return matches;
}

export function createNaiveSwissPairings(tourney: Tourney): Match[] {
  // create pool of unmatched players, sorted by Score DESC
  const standings = tourney.standings();
  const orderedPlayers = tourney.orderStandings(standings).map(standing => standing.player);
  let unmatchedPlayers: Set<string> = new Set(orderedPlayers);
  // Unmatched players from previous brackets will be held in floaters
  let floaters: Set<string> = new Set();
  let matches: Match[] = [];

  // process new bracket (players with same score + floaters)
  while (unmatchedPlayers.size > 0 || floaters.size > 0) {
    // Fill bracket with floaters and other unmatched players with top score
    const bracket = createBracket(floaters, unmatchedPlayers, standings);
    const bracketMatches: Match[] = [];
    const bracketMatchedPlayers = new Set<string>();

    let failedOptimalPairing = false;
    let pairingSuccessful = false;

    let bracketIterations = 0;

    while (bracketIterations < 10 && bracket.length > 1) {
      // Take each player from bracket and try to match with another player
      matchPlayersWithinBracket(bracket, bracketMatchedPlayers, bracketMatches, tourney, failedOptimalPairing);

      const unmatchedNum = bracket.length - bracketMatchedPlayers.size;
      if (unmatchedNum === 1) {
        // add float
        floaters = new Set(bracket.filter(p => !bracketMatchedPlayers.has(p)));
        console.log('Paired players within bracket successfully with floaters');
        console.log('bracket matches', bracketMatches);
        console.log('bracket', bracket);
        pairingSuccessful = true;
        break;
      } else if (unmatchedNum === 0) {
        console.log('Paired players within bracket successfully with floaters');
        console.log('bracket matches', bracketMatches);
        console.log('bracket', bracket);
        floaters = new Set();
        pairingSuccessful = true;
        break;
      }
      failedOptimalPairing = true;
      bracketIterations++;
      pairingSuccessful = false;
    }

    if (pairingSuccessful) {
      console.log('Pairing successful');
      console.log('Floaters', floaters);
      console.log('Bracket matched players', bracketMatchedPlayers);
      // Add matches
      matches = [...matches, ...bracketMatches];
      console.log('Unmatched players', unmatchedPlayers);

      unmatchedPlayers = new Set([...unmatchedPlayers].filter(
        p => !bracketMatchedPlayers.has(p) && !floaters.has(p),
      ));
      console.log('New unmatched players', unmatchedPlayers);
    } else {
      console.log('Pairings not successful');
      console.log('bracket', bracket);
      console.log('unmatched players', unmatchedPlayers);

      // Either awarding Byes to Odd player or Failed to match in this bracket
      // Add all current round players to floaters and try to match in next bracket or finish by awarding Byes
      floaters = new Set([...bracket]);
      unmatchedPlayers = new Set([...unmatchedPlayers].filter(p => !floaters.has(p)));

      if (unmatchedPlayers.size === 0) {
        console.log('Award byes to all floaters', floaters);
        // Award Byes to all floaters and finish algorithm
        // NOTE: This will assign multiple BYEs in case of algorithm failing to create pairings
        for (const player of floaters.values()) {
          matches.push(new Match(player, null));
        }

        return matches;
      }
    }
  }

  return matches;
}

