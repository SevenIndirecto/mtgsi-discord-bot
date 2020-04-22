import { Message } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { state } from '../../state';
import { persistState, loadState } from '../../util/persist';

module.exports = class StateManageCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'state',
      group: 'organizer',
      memberName: 'state',
      description: 'Reload or persist bot state',
      ownerOnly: true,
      args: [
        {
          key: 'action',
          prompt: 'Reload or persist bot state',
          type: 'string',
          oneOf: ['reload', 'persist'],
        },
      ],
    });
  }

  run(message: CommandoMessage, { action }: { action: string }): Promise<Message | Message[]> {
    if (action === 'persist') {
      persistState();
      return message.say('State persisted');
    }

    if (action === 'reload') {
      // TODO: Need to instantiate classes, etc etc...
      if (loadState()) {
        return message.say(`Loaded last state, tourney id ${state?.tourney?.id}`);
      }
      return message.say('Failed to load state');
    }

    return message.say('Invalid action');
  }
};

export {};
