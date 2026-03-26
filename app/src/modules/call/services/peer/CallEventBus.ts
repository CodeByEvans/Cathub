type Cb<T = void> = T extends void ? () => void : (arg: T) => void;

export class CallEventBus {
  private onIncomingCallCb: Cb<string> | null = null;
  private onOutgoingCallCb: Cb | null = null;
  private onCallConnectedCb: Cb | null = null;
  private onCallEndedCb: Cb | null = null;
  private onRemoteStreamCb: Cb<MediaStream> | null = null;
  private onChatMessageCb: Cb<string> | null = null;

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
}
