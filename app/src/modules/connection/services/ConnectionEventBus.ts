type Cb<T = void> = T extends void ? () => void : (arg: T) => void;

export class ConnectionEventBus {
  private onConnectionAcceptedCb: Cb<any> | null = null;
  private onConnectionUpdatedCb: Cb<any> | null = null;
  private onConnectionRevokedCb: Cb | null = null;

  // -------------------
  // Registro de callbacks
  // -------------------
  onConnectionAccepted(cb: Cb<any>) {
    this.onConnectionAcceptedCb = cb;
  }

  onConnectionUpdated(cb: Cb<any>) {
    this.onConnectionUpdatedCb = cb;
  }

  onConnectionRevoked(cb: Cb) {
    this.onConnectionRevokedCb = cb;
  }

  // -------------------
  // Emisión de eventos
  // -------------------
  emitConnectionAccepted(connection: any) {
    this.onConnectionAcceptedCb?.(connection);
  }

  emitConnectionUpdated(connection: any) {
    this.onConnectionUpdatedCb?.(connection);
  }

  emitConnectionRevoked() {
    this.onConnectionRevokedCb?.();
  }
}
