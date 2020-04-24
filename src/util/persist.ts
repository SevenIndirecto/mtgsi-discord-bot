import { writeFileSync, readFileSync } from 'fs';
import * as serialize from 'serialize-javascript';
import { Match } from '../models/match';
import { state } from '../state';
import exp = require('constants');

const PERSIST_FILE = '_persist.state.js';
const EXPORT_FILE_TEMPLATE = 'tourney.{id}.json';

interface ExportPackage {
  rounds: Match[][];
}
export function exportActiveTourney(): boolean {
  if (!state.tourney) {
    return false;
  }
  try {
    const fileOut = EXPORT_FILE_TEMPLATE.replace('{id}', state.tourney.id);
    const dump: ExportPackage = {
      rounds: [],
    };

    for (const round of state.tourney.rounds) {
      const roundMatches = [];
      for (const match of round) {
        roundMatches.push(match);
      }
      dump.rounds.push(roundMatches);
    }
    writeFileSync(fileOut, JSON.stringify(dump));
    return true;
  } catch (e) {
    return false;
  }
}
export function persistState(): void {
  try {
    writeFileSync(PERSIST_FILE, serialize(state.tourney));
  } catch (e) {
    console.log(e);
  }
}

export function loadState(): boolean {
  try {
    const persistedState = readFileSync(PERSIST_FILE);
    if (persistedState) {
      state.tourney = eval(`(${persistedState})`);
      return true;
    }
    return false;
  } catch (e) {
    console.error(e);
  }
  return false;
}

