type Cb<T = void> = T extends void ? () => void : (arg: T) => void;

export class CallEventBus {
  private onIncomingCallCb: Cb<string> | null = null;
  private onOutgoingCallCb: Cb | null = null;
  private onCallConnectedCb: Cb | null = null;
  private onCallEndedCb: Cb | null = null;
  private onRemoteStreamCb: Cb<MediaStream> | null = null;
  private onChatMessageCb: Cb<string> | null = null;
  private onErrorMessageCb: Cb<string> | null = null;
  private onPartnerMutedCb: ((muted: boolean) => void) | null = null;
  private onPartnerDeafenedCb: ((deafened: boolean) => void) | null = null;
  private onPartnerTypingCb: ((typing: boolean) => void) | null = null;

  // Registro
  onIncomingCall(cb: Cb<string>) {
    this.onIncomingCallCb = cb;
  }
  onOutgoingCall(cb: Cb) {
    this.onOutgoingCallCb = cb;
  }
  onCallConnected(cb: Cb) {
    this.onCallConnectedCb = cb;
  }
  onCallEnded(cb: Cb) {
    this.onCallEndedCb = cb;
  }
  onRemoteStream(cb: Cb<MediaStream>) {
    this.onRemoteStreamCb = cb;
  }
  onChatMessage(cb: Cb<string>) {
    this.onChatMessageCb = cb;
  }
  onErrorMessage(cb: Cb<string>) {
    this.onErrorMessageCb = cb;
  }
  onPartnerMuted(cb: (muted: boolean) => void) {
    this.onPartnerMutedCb = cb;
  }
  onPartnerDeafened(cb: (deafened: boolean) => void) {
    this.onPartnerDeafenedCb = cb;
  }
  onPartnerTyping(cb: (typing: boolean) => void) {
    this.onPartnerTypingCb = cb;
  }

  // Emisión
  emitIncomingCall(callerId: string) {
    this.onIncomingCallCb?.(callerId);
  }
  emitOutgoingCall() {
    this.onOutgoingCallCb?.();
  }
  emitCallConnected() {
    this.onCallConnectedCb?.();
  }
  emitCallEnded() {
    this.onCallEndedCb?.();
  }
  emitRemoteStream(s: MediaStream) {
    this.onRemoteStreamCb?.(s);
  }
  emitChatMessage(msg: string) {
    this.onChatMessageCb?.(msg);
  }
  emitErrorMessage(msg: string) {
    this.onErrorMessageCb?.(msg);
  }
  emitPartnerMuted(muted: boolean) {
    this.onPartnerMutedCb?.(muted);
  }
  emitPartnerDeafened(deafened: boolean) {
    this.onPartnerDeafenedCb?.(deafened);
  }
  emitPartnerTyping(typing: boolean) {
    this.onPartnerTypingCb?.(typing);
  }
}
