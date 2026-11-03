import { useVoicePage } from '../smartstock/useVoicePage';

export const path = '/stock';
export const title = 'Stock · SmartStock';

// The page itself is drawn by the shared voice engine; this file only says which scene to show.
export default function Stock() {
  useVoicePage('stock');
  return null;
}
