require('dotenv').config();
import * as path from 'path';
import { CommandoClient } from 'discord.js-commando';
import { state } from './state';
import { exportActiveTourney } from './util/persist';

const client = new CommandoClient({
    commandPrefix: 'm!',
    owner: process.env.OWNER,
    invite: process.env.INVITE,
});

client.registry
    .registerDefaultTypes()
    .registerGroups([
        ['tourney', 'Tournament support'],
        ['organizer', 'Organizer exclusive'],
        ['fun', 'Various fun activities and cat corpse disposal tips'],
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

state.client = client;

process.on('SIGINT', () => {
  console.log('Exporting tourney');
  exportActiveTourney();
  process.exit(2);
});
