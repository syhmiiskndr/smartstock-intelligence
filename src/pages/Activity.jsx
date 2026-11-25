import { useVoicePage } from '../smartstock/useVoicePage';

export const path = '/activity';
export const title = 'Activity · SmartStock';

// The page itself is drawn by the shared voice engine; this file only says which scene to show.
export default function Activity() {
  useVoicePage('audit');
  return null;
}
