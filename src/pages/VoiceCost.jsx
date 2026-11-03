import { useVoicePage } from '../smartstock/useVoicePage';

export const path = '/voice/cost';
export const title = 'SmartStock Voice · Cost';

// The page itself is drawn by the shared voice engine; this file only says which scene to show.
export default function VoiceCost() {
  useVoicePage('cost');
  return null;
}
