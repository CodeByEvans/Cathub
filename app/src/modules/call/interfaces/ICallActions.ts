export interface ICallActions {
  startCall(audioOnly: boolean): Promise<MediaStream>;
  endCall(): Promise<void>;
  acceptCall: (audioOnly: boolean) => Promise<MediaStream>;
  rejectCall(): void;
  cancelCall(): Promise<void>;
  toggleMute(): boolean;
  toggleDeaf(): boolean;
  toggleVideo(): boolean;
  sendChatMessage(message: string): Promise<void>;
  simulateIncomingCall(): void;
  simulateInCall(): void;
  simulateOutgoingCall(): void;
}
