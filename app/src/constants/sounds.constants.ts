import hoverSound from "@/assets/sounds/hover.wav";
import clickSound from "@/assets/sounds/click.wav";
import SendSound from "@/assets/sounds/send.wav";
import ErrorSound from "@/assets/sounds/error.wav";
import ringtoneSound from "@/assets/sounds/ringtone.wav";
import incomingNoteSound from "@/assets/sounds/Note_in_app.wav";
import muteSound from "@/assets/sounds/mute.wav";
import unmuteSound from "@/assets/sounds/unmute.wav";
import callStartedSound from "@/assets/sounds/call_started.wav";
import callEndedSound from "@/assets/sounds/call_ended.wav";

export const SOUNDS = {
  hover: hoverSound,
  click: clickSound,
  ringtone: ringtoneSound,
  error: ErrorSound,
  send: SendSound,
  incomingNote: incomingNoteSound,
  mute: muteSound,
  unmute: unmuteSound,
  callStarted: callStartedSound,
  callEnded: callEndedSound,
} as const;

export type SoundKey = keyof typeof SOUNDS;
