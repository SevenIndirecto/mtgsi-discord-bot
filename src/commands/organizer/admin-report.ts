import { Message } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { TourneyStatus } from '../../models/tourney';
import { state } from '../../state';

interface AdminReportMsg {
  winner: string;
  wins: number;
  losses: number;
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
          type: 'integer',
          oneOf: [0, 1, 2],
        },
        {
          key: 'losses',
          prompt: 'How many games did the winner lose?',
          type: 'integer',
          oneOf: [0, 1, 2],
        },
      ],
    });
  }

  run(
    message: CommandoMessage,
    { winner, wins, losses }: AdminReportMsg,
  ): Promise<Message | Message[]> | null {
    if (state.tourney && state.tourney.status === TourneyStatus.RoundInProgress) {
      let playerId = message.mentions.users.first()?.id;
      if (!playerId) {
        // Use assume an actual number was used here... though likely this is just a dev thing.
        playerId = winner;
      }
      if (!state.tourney.playerToMatchMap.has(playerId)) {
        return null;
      }
      const match = state.tourney.playerToMatchMap.get(playerId);
      if (match?.adminReport(playerId, wins, losses)) {
        return message.say('Set match result.');
      }
    }
    return null;
  }
};

export {};
