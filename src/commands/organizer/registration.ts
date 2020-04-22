import { Message } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { Tourney, TourneyStatus } from '../../models/tourney';
import { state } from '../../state';

interface RegistrationActionMsg {
  action: string;
  tid?: string;
}

module.exports = class RegistrationOpenCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'registration',
      group: 'organizer',
      memberName: 'registration',
      description: 'Open registrations for tournament',
      ownerOnly: true,
      args: [
        {
          key: 'action',
          prompt: 'Either open, close or limit registration',
          type: 'string',
          oneOf: ['open', 'close', 'limit'],
        },
        {
          key: 'tid',
          prompt: 'Tournament ID',
          type: 'string',
          default: 'latest',
        },
      ],
    });
  }

  run(
    message: CommandoMessage,
    { action, tid = 'latest' }: RegistrationActionMsg,
  ): Promise<Message | Message[]> | null {
    if (action === 'open') {
      if (state.tourney) {
        return message.say(`A tourney is already active`);
      }
      state.tourney = new Tourney(tid);
      return message.say(`Opened registration for simple-mode tourney`);
    }

    if (!state.tourney) {
      return message.say('Tourney has not been initialized, use open');
    }

    if (action === 'close') {
      state.tourney.setState(TourneyStatus.RegClosed);
      return message.say('Registration and decklist submissions closed');
    } else if (action === 'limit') {
      state.tourney.setState(TourneyStatus.RegLimited);
      return message.say(`Registration closed, decklist updates still allowed`);
    }
    return null;
  }
};

export {};
