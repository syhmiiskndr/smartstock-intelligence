import { useVoicePage } from '../smartstock/useVoicePage';

export const path = '/rules';
export const title = 'Rules · SmartStock';

// The page itself is drawn by the shared voice engine; this file only says which scene to show.
export default function Rules() {
  useVoicePage('rules');
  return null;
}
