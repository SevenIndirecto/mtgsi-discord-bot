import { CommandoClient } from 'discord.js-commando';
import { Tourney } from './models/tourney';

class State {
  tourney?: Tourney;
  client?: CommandoClient;
}

export const state = new State();
