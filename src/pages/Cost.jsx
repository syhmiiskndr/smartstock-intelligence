import { useVoicePage } from '../smartstock/useVoicePage';

export const path = '/cost';
export const title = 'Cost · SmartStock';

// The page itself is drawn by the shared voice engine; this file only says which scene to show.
export default function Cost() {
  useVoicePage('cost');
  return null;
}
