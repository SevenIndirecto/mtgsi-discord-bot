import { oneLine } from 'common-tags';
import { Match } from './match';
import { Standing } from './standing';
import { createRandomPairings, createNaiveSwissPairings } from '../util/matchmaking';

export const enum TourneyStatus {
  RegOpen,
  RegClosed,
  RegLimited,
  RoundInProgress,
  BetweenRounds,
  Finished
}

export class Tourney {
  registrations: Map<string, string | null>;
  status: TourneyStatus;
  rounds: Match[][];
  playerToMatchMap: Map<string, Match>;


  constructor(public id: string, public round = -1) {
    this.registrations = new Map<string, string | null>();
    this.status = TourneyStatus.RegOpen;
    this.rounds = [];
    this.playerToMatchMap = new Map<string, Match>();
  }

  setState(state: TourneyStatus): void {
    this.status = state;
  }

  toString(): string {
    return `ID ${this.id} R${this.round} State ${this.status} #regs: ${this.registrations.size}`;
  }

  register(user: string, deck: string | null = null): boolean {
    if (this.status === TourneyStatus.RegOpen) {
      this.registrations.set(user, deck);
      return true;
    } else if (this.status === TourneyStatus.RegLimited) {
      if (this.registrations.has(user)) {
        this.registrations.set(user, deck);
        return true;
      }
    }
    return false;
  }

  statusDisplay(): string {
    const description = {
      [TourneyStatus.RegOpen]: 'Accepting registrations',
      [TourneyStatus.RegLimited]: 'Registration closed, accepting decklists',
      [TourneyStatus.RegClosed]: 'Registration and decklist submissions closed',
      [TourneyStatus.RoundInProgress]: 'Round in progress',
      [TourneyStatus.BetweenRounds]: 'Waiting for round to start',
      [TourneyStatus.Finished]: 'Finished',
    };
    return `Tourney state: ${description[this.status]}.`;
  }

  unreportedMatchesInRound(): number {
    if (this.round < 0) {
      return 0;
    }
    return this.rounds[this.round].filter(match => !match.confirmed).length;
  }

  newRound(): string {
    if (this.unreportedMatchesInRound() > 0) {
      return 'ERROR: Some matches have not been reported.';
    }
    this.round++;
    this.rounds.push([]);

    let matches;
    if (this.round === 0) {
      const players = Array.from(this.registrations.keys());
      matches = createRandomPairings(players);
      console.log('Created random pairings');
    } else {
      matches = createNaiveSwissPairings(this);
      console.log('Created swiss pairings');
    }
    this.rounds[this.round] = matches;
    for (const match of matches) {
      this.playerToMatchMap.set(match.p1, match);
      if (match.p2) {
        this.playerToMatchMap.set(match.p2, match);
      }
    }

    // TODO: If we want timers, this should not start the round, but rather close registration
    this.status = TourneyStatus.RoundInProgress;
    return this.pairings();
  }


  pairings(): string {
    if (this.round < 0 || this.rounds[this.round].length < 1) {
      return 'Pairings for what?';
    }

    const pairingsStrings = [];
    let i = 0;
    for (const match of this.rounds[this.round]) {
      i++;
      if (!match.bye && match.p2) {
        pairingsStrings.push(
          oneLine`
            ${i}.
            <@${match.p1}> (${this.registrations.get(match.p1)})
            vs
            <@${match.p2}> (${this.registrations.get(match.p2)})
        `);
      } else {
        pairingsStrings.push(`${i} BYE: <@${match.p1}>`);
      }
    }
    return pairingsStrings.join('\n');
  }

  standings(): Map<string, Standing> {
    const standings = new Map<string, Standing>();
    if (this.registrations.size < 1) {
      return standings;
    }

    for (const [player, deck] of this.registrations) {
      standings.set(player, new Standing(player, deck));
    }

    for (const round of this.rounds) {
      for (const match of round) {
        if (!match.confirmed) {
          continue;
        }

        for (const player of [match.p1, match.p2]) {
          if (player === null) {
            continue;
          }
          const standing = standings.get(player);
          if (!standings.has(player)) {
            continue;
          }
          if (match.bye) {
            standing!.setResult(2, 0, true);
          } else if (player === match.winner || match.draw) {
            standing!.setResult(
              match.wins!,
              match.losses!,
            );
          } else {
            standing!.setResult(
              match.losses!,
              match.wins!,
            );
          }
        }
      }
    }
    return standings;
  }

  orderStandings(standings: Map<string, Standing>): Standing[] {
    return [...standings.values()].sort((a, b) => {
      if (a.points === b.points) {
        return +b.tiebreaker - +a.tiebreaker;
      }
      return b.points - a.points;
    });
  }

  standingsToString(): string {
    if (this.registrations.size < 1) {
      return 'No participants yet.';
    }
    const standings = this.orderStandings(this.standings());
    const output = [];

    let i = 0;
    for (const standing of standings) {
      i++;
      let str = `${i}. (${standing.points}) <@${standing.player}> (deck: ${standing.deck ? standing.deck : 'n/a'})`;
      str += ` matches: ${standing.matchWins}:${standing.matchLosses}:${standing.matchDraws}`;
      str += ` games: ${standing.gameWins}:${standing.gameLosses}`;
      str += ` byes: ${standing.byes}`;
      output.push(str);
    }
    return output.join('\n');
  }
}
