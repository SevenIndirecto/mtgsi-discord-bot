export class Standing {
  constructor(
    public player: string,
    public deck: string | null = null,
    public matchWins: number = 0,
    public matchLosses: number = 0,
    public matchDraws: number = 0,
    public gameWins: number = 0,
    public gameLosses: number = 0,
    public byes: number = 0,
  ) {
    this.deck = deck;
  }

  setResult(wins: number, losses: number, bye = false): void {
    if (bye) {
      this.matchWins += 1;
      this.gameWins += 2;
      this.byes += 1;
      return;
    }

    if (wins > losses) {
      this.matchWins += 1;
    } else if (wins < losses) {
      this.matchLosses += 1;
    } else {
      this.matchDraws += 1;
    }

    this.gameWins += wins;
    this.gameLosses += losses;
  }

  get points(): number {
    return 3 * this.matchWins + this.matchDraws;
  }

  get tiebreaker(): string {
    if (this.gameWins + this.gameLosses === 0) {
      return '0.00';
    }
    return (this.gameWins / (this.gameWins + this.gameLosses)).toFixed(2);
  }
}
