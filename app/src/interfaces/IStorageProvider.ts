import { StoreKey, StoreValueMap } from "@/shared/infrastructure/store.keys";

export interface IStorageProvider {
  get<K extends StoreKey>(key: K): Promise<StoreValueMap[K] | null>;
  set<K extends StoreKey>(key: K, value: StoreValueMap[K]): Promise<void>;
  delete(key: StoreKey): Promise<void>;
  clear(keys: StoreKey[]): Promise<void>;
}
