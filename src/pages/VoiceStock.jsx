import { useVoicePage } from '../smartstock/useVoicePage';

export const path = '/voice/stock';
export const title = 'SmartStock Voice · Stock';

// The page itself is drawn by the shared voice engine; this file only says which scene to show.
export default function VoiceStock() {
  useVoicePage('stock');
  return null;
}
