import { useVoicePage } from '../smartstock/useVoicePage';

export const path = '/fresh';
export const title = 'Freshness · SmartStock';

// The page itself is drawn by the shared voice engine; this file only says which scene to show.
export default function Fresh() {
  useVoicePage('fresh');
  return null;
}
