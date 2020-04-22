import { Message } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { TourneyStatus } from '../../models/tourney';
import { state } from '../../state';

module.exports = class RoundCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'round',
      group: 'organizer',
      memberName: 'round',
      description: 'Create new round pairings, start or end the round.',
      ownerOnly: true,
      args: [
        {
          key: 'action',
          prompt: 'Create new round pairings, start or end the round.',
          type: 'string',
          oneOf: ['pairings', 'start', 'end'],
        },
      ],
    });
  }

  run(message: CommandoMessage, { action }: { action: string }): Promise<Message | Message[]> {
    if (!state.tourney) {
      return message.say('No tournament in progress');
    }

    if (action === 'start') {
      if (![
        TourneyStatus.RegClosed,
        TourneyStatus.RegLimited,
        TourneyStatus.BetweenRounds,
      ].includes(state.tourney.status)) {
        return message.say(`Invalid Tourney state. ${state.tourney.statusDisplay()}`);
      }
      state.tourney.status = TourneyStatus.RoundInProgress;
      return message.say(`Round ${state.tourney.round + 1} has started, you have 50 minutes. Have fun!`);
    }

    if (action === 'pairings') {
      if (![
        TourneyStatus.RegClosed,
        TourneyStatus.RegLimited,
        TourneyStatus.BetweenRounds,
      ].includes(state.tourney.status)) {
        return message.say(`Invalid Tourney state. ${state.tourney.statusDisplay()}`);
      }
      // Start new round and pairings
      return message.say(state.tourney.newRound());
    }

    if (action === 'end') {
      if (state.tourney.status !== TourneyStatus.RoundInProgress) {
        return message.say(`Invalid Tourney state. ${state.tourney.statusDisplay()}`);
      }
      state.tourney.status = TourneyStatus.BetweenRounds;
      return message.say('Round finished');
    }

    return message.say('Invalid action');
  }
};

export {};
