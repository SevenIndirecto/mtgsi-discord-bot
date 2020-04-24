import { oneLine } from 'common-tags';
import { Message } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
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
      if (state.tourney.startRound()) {
        return message.say(oneLine`
          Round ${state.tourney.round + 1} has started,
          you have ${state.tourney.roundLength} minutes. Have fun!
        `);
      } else {
        return message.say(`Invalid Tourney state. ${state.tourney.statusDisplay()}.`);
      }
    }

    if (action === 'pairings') {
      if (!state.tourney.waitingForRoundToStart()) {
        return message.say(`Invalid Tourney state. ${state.tourney.statusDisplay()}.`);
      }
      // Start new round and pairings
      return message.say(`${state.tourney.newRound()}. \n\n Use \`round start\` to start round.`);
    }

    if (action === 'end') {
      return message.say(state.tourney.endRound());
    }

    return message.say('Invalid action');
  }
};

export {};
