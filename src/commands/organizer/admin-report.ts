import { Message } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { TourneyStatus } from '../../models/tourney';
import { state } from '../../state';

interface AdminReportMsg {
  player1: string;
  winner: string;
  wins: string;
  losses: string;
  draw: string;
}

module.exports = class AdminRegisterCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'admin-report',
      group: 'organizer',
      memberName: 'admin-report',
      description: 'Report match result',
      guildOnly: true,
      ownerOnly: true,
      args: [
        {
          key: 'winner',
          prompt: 'Winning player',
          type: 'string',
        },
        {
          key: 'wins',
          prompt: 'How many games did the winner win?',
          type: 'string',
          oneOf: ['0', '1', '2'],
        },
        {
          key: 'losses',
          prompt: 'How many games did the winner lose?',
          type: 'string',
          // TODO: This numeric type / boolean types etc...
          oneOf: ['0', '1', '2'],
        },
        {
          key: 'draw',
          prompt: 'Was it a draw?',
          type: 'string',
          default: 'false',
        },
      ],
    });
  }

  run(
    message: CommandoMessage,
    { player1, winner, wins, losses, draw }: AdminReportMsg,
  ): Promise<Message | Message[]> | null {
    if (state.tourney && state.tourney.status === TourneyStatus.RoundInProgress) {
      const playerId = player1;
      if (!state.tourney.playerToMatchMap.has(playerId)) {
        return null;
      }
      const match = state.tourney.playerToMatchMap.get(playerId);
      if (match?.adminReport(winner, +wins, +losses, Boolean(draw))) {
        return message.say('Set match result.');
      }
    }
    return null;
  }
};

export {};
