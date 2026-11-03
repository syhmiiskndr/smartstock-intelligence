import { useVoicePage } from '../smartstock/useVoicePage';

export const path = '/people';
export const title = 'People · SmartStock';

// The page itself is drawn by the shared voice engine; this file only says which scene to show.
export default function People() {
  useVoicePage('people');
  return null;
}
