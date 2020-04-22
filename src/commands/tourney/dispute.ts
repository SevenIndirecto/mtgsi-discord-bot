import { Message } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { TourneyStatus } from '../../models/tourney';
import { state } from '../../state';

module.exports = class DisputeCommand extends Command {
// export class RegisterCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'dispute',
      // aliases: ['kitty-cat'],
      group: 'tourney',
      memberName: 'dispute',
      description: 'Dispute match result',
      guildOnly: true,
    });
  }

  run(message: CommandoMessage): Promise<Message | Message[]> | null {
    if (state.tourney && state.tourney.status === TourneyStatus.RoundInProgress) {
      const playerId = message.author.id;
      if (!state.tourney.playerToMatchMap.has(playerId)) {
        return null;
      }
      const match = state.tourney.playerToMatchMap.get(playerId);
      if (!match) {
        return null;
      }
      if (match.dispute()) {
        return message.say('Match report nullified, awaiting new report.');
      } else {
        return message.say('Match result already confirmed.');
      }
    }
    return message.reply('lmao');
  }
};

export {};
