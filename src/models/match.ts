export class Match {
  p1: string;
  p2: string | null;
  // player id of winner
  winner?: string | null;
  wins?: number;
  losses?: number;
  draw: boolean;
  bye: boolean;
  confirmed: boolean;
  reportedBy: Array<string>;

  constructor(p1: string, p2: string | null) {
    this.p1 = p1;
    this.p2 = p2;
    this.bye = p2 === null;
    this.draw = false;
    this.confirmed = false;
    this.reportedBy = [];

    if (this.bye) {
      this.confirmed = true;
      this.wins = 2;
      this.losses = 0;
    }
  }

  adminReport(winner: string, wins: number, losses: number, isDraw = false): void {
    if (this.confirmed) {
      return;
    }

    this.winner = winner;
    this.wins = wins;
    this.losses = losses;
    this.draw = isDraw;
    this.confirmed = true;
  }

  clearReports(): void {
    this.confirmed = false;
    this.reportedBy = [];
    this.losses = undefined;
    this.wins = undefined;
    this.winner = undefined;
    this.draw = false;
  }

  dispute(): boolean {
    if (this.confirmed || this.bye) {
      return false;
    }

    this.clearReports();
    return true;
  }

  confirm(playerId: string): boolean {
    if (this.confirmed || this.bye || this.reportedBy.length < 1 || playerId in this.reportedBy) {
      return false;
    }
    this.reportedBy.push(playerId);
    this.confirmed = true;
    return true;
  }

  report(playerId: string, isWinner: boolean, wins: number, losses: number, isDraw = false): boolean {
    if (this.confirmed || this.bye || this.reportedBy.length === 1) {
      return false;
    }

    this.wins = wins;
    this.losses = losses;
    this.reportedBy.push(playerId);

    if (isDraw) {
      this.draw = true;
    } else {
      let winner;
      if (isWinner) {
        winner = playerId;
      } else {
        winner = this.p1 === playerId ? this.p2 : this.p1;
      }
      this.winner = winner;
    }
    return true;
  }
}
