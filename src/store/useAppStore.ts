import { useSyncExternalStore } from 'react';
import { getState, subscribe } from './projectStore';
import type { AppState } from '../types';

export function useAppStore(): AppState {
  return useSyncExternalStore(subscribe, getState, getState);
}
