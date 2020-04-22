import { Message } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { Tourney } from '../../models/tourney';
import { state } from '../../state';

const registrations: [string, string][] = [
  ['1', 'deck1'],
  ['2', 'deck2'],
  ['3', 'deck3'],
  ['4', 'deck4'],
  ['700432725290778655', 'deck5'],
  ['700433371981152296', 'deck6'],
  ['7', 'deck7'],
];

module.exports = class ProvisionCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'provision',
      group: 'organizer',
      memberName: 'provision',
      description: 'Provision various states for development',
      ownerOnly: true,
    });
  }

  run(message: CommandoMessage): Promise<Message | Message[]> {
    state.tourney = new Tourney('provision1');

    for (const reg of registrations) {
      state.tourney.register(...reg);
    }

    return message.say(`Provisioned new tournament ${state.tourney.id}`);
  }
};

export {};
