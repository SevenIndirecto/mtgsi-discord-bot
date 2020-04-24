import { Message } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import * as _ from 'lodash';

module.exports = class FlavorCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'flavor',
      group: 'fun',
      memberName: 'flavor',
      description: '~ ? ~',
    });
  }

  run(message: CommandoMessage): Promise<Message | Message[]> | null {
    const flavorPool = [
      'Feed me more flavor you cunts.',
      'Furries are *people* too.',
      '**Little known fact:** Jerman je odpru watery grave, foil ass trophy, foil swamp, pa nek rare.',
    ];
    return message.say(_.sample(flavorPool));
  }
};

export {};
