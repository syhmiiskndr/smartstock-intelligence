import { useVoicePage } from '../smartstock/useVoicePage';

export const path = '/voice/approvals';
export const title = 'SmartStock Voice · Approvals';

// The page itself is drawn by the shared voice engine; this file only says which scene to show.
export default function VoiceApprovals() {
  useVoicePage('ops');
  return null;
}
