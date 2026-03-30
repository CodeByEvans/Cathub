type Cb<T = void> = (data: T) => void;

type PresenceStatus = {
  isOnline: boolean;
  lastSeen: Date | null;
};

export class PresenceEventBus {
  private onStatusChangeCb: Cb<PresenceStatus> | null = null;
  private onReconnectCb: Cb | null = null;
  private onLastSeenCb: Cb<Date> | null = null;
  private onPartnerStatusChangeCb: Cb<boolean> | null = null;
  private onPartnerLeftCb: Cb | null = null;
  private onDisconnectCb: Cb | null = null;

  // Registro
  onStatusChange(cb: Cb<PresenceStatus>) {
    this.onStatusChangeCb = cb;
  }

  onReconnect(cb: Cb) {
    this.onReconnectCb = cb;
  }

  onLastSeen(cb: Cb<Date>) {
    this.onLastSeenCb = cb;
  }

  onPartnerStatusChange(cb: Cb<boolean>) {
    this.onPartnerStatusChangeCb = cb;
  }

  onPartnerLeft(cb: Cb) {
    this.onPartnerLeftCb = cb;
  }

  onDisconnect(cb: Cb) {
    this.onDisconnectCb = cb;
  }

  // Emisión
  emitStatusChange(status: PresenceStatus) {
    this.onStatusChangeCb?.(status);
  }

  emitReconnect() {
    this.onReconnectCb?.();
  }

  emitLastSeen(lastSeen: Date) {
    this.onLastSeenCb?.(lastSeen);
  }

  emitPartnerStatusChange(isOnline: boolean) {
    this.onPartnerStatusChangeCb?.(isOnline);
  }

  emitPartnerLeft() {
    this.onPartnerLeftCb?.();
  }

  emitOnDisconnect() {
    this.onDisconnectCb?.();
  }
}
