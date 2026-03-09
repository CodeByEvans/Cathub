import hoverSound from "@/assets/sounds/hover.wav";
import clickSound from "@/assets/sounds/click.wav";
import SendSound from "@/assets/sounds/send.wav";
import ErrorSound from "@/assets/sounds/error.wav";
import ringtoneSound from "@/assets/sounds/ringtone.wav";

export const SOUNDS = {
  hover: hoverSound,
  click: clickSound,
  ringtone: ringtoneSound,
  error: ErrorSound,
  send: SendSound,
} as const;

export type SoundKey = keyof typeof SOUNDS;
