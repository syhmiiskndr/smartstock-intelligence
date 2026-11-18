import { useVoicePage } from '../smartstock/useVoicePage';

export const path = '/analytics';
export const title = 'Analytics · SmartStock';

// The page itself is drawn by the shared voice engine; this file only says which scene to show.
export default function Analytics() {
  useVoicePage('analytics');
  return null;
}
