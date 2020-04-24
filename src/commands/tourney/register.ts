import { Message } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { state } from '../../state';

const deckRegex = /^[0-9a-z]{5,30}$/;
module.exports = class RegisterCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'register',
      group: 'tourney',
      memberName: 'register',
      description: 'Register for a tournament using a decklist',
      guildOnly: true,
      args: [
        {
          key: 'deck',
          prompt: 'Enter a deck ID',
          type: 'string',
          validate: (text: string): boolean => deckRegex.test(text),
        },
      ],
    });
  }

  run(message: CommandoMessage, { deck }: { deck: string }): Promise<Message | Message[]> | null {
    if (state.tourney) {
      if (state.tourney.register(message.author.id, deck)) {
        return message.reply(`Registered and set deck id to ${deck}`);
      } else {
        return message.reply('Registration closed or limited to deck submissions');
      }
    }
    return null;
  }
};

export {};
