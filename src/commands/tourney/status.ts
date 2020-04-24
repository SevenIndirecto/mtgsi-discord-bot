import { Message } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { state } from '../../state';

module.exports = class StatusCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'status',
      group: 'tourney',
      memberName: 'status',
      description: 'Check tournament status',
    });
  }

  run(message: CommandoMessage): Promise<Message | Message[]> | null {
    if (!state.tourney) {
      return message.say('No tournament active.');
    }

    return message.say(`Tournament (${state.tourney.id}) state: ${state.tourney.statusDisplay()}.`);
  }
};

export {};
