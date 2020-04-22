import { writeFileSync, readFileSync } from 'fs';
import * as serialize from 'serialize-javascript';
import { state } from '../state';

const PERSIST_FILE = '_persist.state.js';

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

