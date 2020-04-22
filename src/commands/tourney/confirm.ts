import { Message } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { TourneyStatus } from '../../models/tourney';
import { state } from '../../state';

module.exports = class ConfirmCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'confirm',
      // aliases: ['kitty-cat'],
      group: 'tourney',
      memberName: 'confirm',
      description: 'Confirm match result',
      guildOnly: true,
    });
  }

  run(message: CommandoMessage): Promise<Message | Message []> | null {
    if (state.tourney && state.tourney.status === TourneyStatus.RoundInProgress) {
      const playerId = message.author.id;
      if (!state.tourney.playerToMatchMap.has(playerId)) {
        return null;
      }
      const match = state.tourney.playerToMatchMap.get(playerId);
      if (!match) {
        return null;
      }
      if (match.confirm(playerId)) {
        return message.say('Match result confirmed.');
      } else {
        return message.say('Match result already confirmed or awaiting other player\'s confirmation.');
      }
    }
    return null;
  }
};

export {};
