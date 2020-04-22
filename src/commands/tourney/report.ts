import { Message } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { TourneyStatus } from '../../models/tourney';
import { state } from '../../state';

interface ResultReportMsg {
  outcome: string;
  wins: string;
  losses: string;
}

module.exports = class ReportCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'report',
      group: 'tourney',
      memberName: 'report',
      description: 'Report match result',
      guildOnly: true,
      args: [
        {
          key: 'outcome',
          prompt: 'Report a win, loss or draw',
          type: 'string',
          oneOf: ['win', 'loss', 'draw'],
        },
        {
          key: 'wins',
          prompt: 'How many games did you win?',
          type: 'string',
          oneOf: ['0', '1', '2'],
        },
        {
          key: 'losses',
          prompt: 'How many games did you lose?',
          type: 'string',
          oneOf: ['0', '1', '2'],
        },
      ],
    });
  }

  run(message: CommandoMessage, { outcome, wins, losses }: ResultReportMsg): Promise<Message | Message[]> | null {
    if (state.tourney && state.tourney.status === TourneyStatus.RoundInProgress) {
      const playerId = message.author.id;
      if (!state.tourney.playerToMatchMap.has(playerId)) {
        return null;
      }
      const match = state.tourney.playerToMatchMap.get(playerId);
      if (!match) {
        return null;
      }
      if (match.report(playerId, outcome === 'win', +wins, +losses, outcome === 'draw')) {
        return message.say(`Reported and waiting for other player to confirm or dispute`);
      } else {
        return message.say('Match already reported or waiting confirmation');
      }
    }
    return null;
  }
};

export {};
