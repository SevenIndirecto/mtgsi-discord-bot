import { Message } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { state } from '../../state';

module.exports = class PairingsCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'pairings',
      group: 'tourney',
      memberName: 'pairings',
      description: 'Display current round pairings',
      throttling: {
        usages: 1,
        duration: 10,
      },
    });
  }

  run(message: CommandoMessage): Promise<Message | Message[]> | null {
    if (!state.tourney) {
      return message.say('No tournament running currently.');
    }

    return message.say(state.tourney.pairings());
  }
};

export {};
