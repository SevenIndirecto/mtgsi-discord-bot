require('dotenv').config();
import * as path from 'path';
import { CommandoClient } from 'discord.js-commando';
import { persistState } from './util/persist';

const client = new CommandoClient({
    commandPrefix: 'm!',
    owner: process.env.OWNER,
    invite: process.env.INVITE,
});

// TODO: Limit to channel?
client.registry
    .registerDefaultTypes()
    .registerGroups([
        ['tourney', 'Tournament support'],
        ['organizer', 'Organizer exclusive'],
    ])
    .registerDefaultGroups()
    .registerDefaultCommands()
    .registerCommandsIn(path.join(__dirname, 'commands'));

client.once('ready', () => {
    console.log(`Logged in as ${client.user?.tag}! (${client.user?.id})`);
});

client.on('error', console.error);
client.on('commandError', (cmd, err, message, args) => {
  console.error('commandError');
  console.error(cmd, err, message, args);
});

client.login(process.env.LOGIN_TOKEN);

process.on('SIGINT', () => {
  console.log('Saving state');
  persistState();
  process.exit(2);
});
