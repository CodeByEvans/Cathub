export const SOUND_KEYS = [
  "hover",
  "click",
  "ringtone",
  "error",
  "send",
  "incomingNote",
  "mute",
  "unmute",
  "callStarted",
  "callEnded",
  "outgoingCall",
] as const;

export type SoundKey = (typeof SOUND_KEYS)[number];
