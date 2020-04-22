import { Message } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import * as _ from 'lodash';
import { state } from '../../state';

module.exports = class DevCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'dev',
      group: 'organizer',
      memberName: 'dev',
      description: 'Dev helper',
      ownerOnly: true,
      args: [
        {
          key: 'action',
          prompt: 'One of',
          type: 'string',
          oneOf: ['simulate-results'],
        },
      ],
    });
  }

  run(message: CommandoMessage, { action }: { action: string }): Promise<Message | Message[]> | null {
    if (action === 'simulate-results') {
      const matches = state.tourney?.rounds[state.tourney.round];
      if (!matches) {
        return message.say('No matches');
      }

      for (const m of matches) {
        const wins = _.sample([0, 1, 2]);
        const losses = _.sample([0, 1, 2]);
        const winner = _.sample([m.p1, m.p2]);
        if (winner) {
          m.adminReport(winner, wins!, losses!, wins === losses);
        }
      }
      return message.say('Results simulated');
    }
    return null;
  }
};

export {};
