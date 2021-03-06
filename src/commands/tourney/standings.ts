import { Message } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { state } from '../../state';

module.exports = class StandingsCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'standings',
      aliases: ['registrations'],
      group: 'tourney',
      memberName: 'standings',
      description: 'Display player standings / registrations',
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

    return message.say(state.tourney.standingsToString());
  }
};

export {};
