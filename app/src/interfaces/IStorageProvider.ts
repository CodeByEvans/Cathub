import { StoreKey } from "@/shared/infrastructure/store.keys";

export interface IStorageProvider {
  get(key: StoreKey): Promise<string | null>;
  set(key: StoreKey, value: string): Promise<void>;
  delete(key: StoreKey): Promise<void>;
  clear(keys: StoreKey[]): Promise<void>;
}
