import { useVoicePage } from '../smartstock/useVoicePage';

export const path = '/voice/fresh';
export const title = 'SmartStock Voice · Freshness';

// The page itself is drawn by the shared voice engine; this file only says which scene to show.
export default function VoiceFresh() {
  useVoicePage('fresh');
  return null;
}
