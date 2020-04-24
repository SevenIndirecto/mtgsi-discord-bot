import { Message, TextChannel } from 'discord.js';
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
      aliases: ['reg'],
      group: 'organizer',
      memberName: 'registration',
      description: 'Open registrations for tournament',
      ownerOnly: true,
      // set to guildOnly to obtain channel
      guildOnly: true,
      args: [
        {
          key: 'action',
          prompt: 'Either open, close or limit registration or end tournament',
          type: 'string',
          oneOf: ['open', 'close', 'limit', 'tourney-end'],
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
        state.tourney.setStatus(TourneyStatus.RegOpen);
        return message.say('Opened registration');
      }
      if (message.channel instanceof TextChannel) {
        state.tourney = new Tourney(tid, message.channel);
        return message.say(`Opened registration for simple-mode swiss tourney. Experimental, have fun crashing.`);
      } else {
        return message.say(
          'Invalid channel type, make sure to use this command in the channel where the tourney is ran not DM.',
        );
      }
    }

    if (!state.tourney) {
      return message.say('Tourney has not been initialized, use open');
    }

    if (action === 'close') {
      state.tourney.setStatus(TourneyStatus.RegClosed);
      return message.say('Registration and decklist submissions closed');
    } else if (action === 'limit') {
      state.tourney.setStatus(TourneyStatus.RegLimited);
      return message.say(`Registration closed, decklist updates still allowed`);
    } else if (action === 'tourney-end') {
      if (state.tourney.status !== TourneyStatus.RoundInProgress) {
        let msg = '**Final Standings:**\n';
        msg += state.tourney.standingsToString();
        state.tourney.status = TourneyStatus.Finished;
        return message.say(msg);
      }
    }
    return null;
  }
};

export {};
