export interface IWindowService {
  bringToFront(): Promise<void>;
  restoreBehavior(): Promise<void>;
}
