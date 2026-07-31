import { IStorageProvider } from "@/interfaces/IStorageProvider";
import { StoreKey, StoreValueMap } from "./store.keys";
import { deleteValue, getValue, setValue } from "@/services/store.service";

/**
 * Fachada única y tipada de acceso a persistencia.
 *
 * `services/store.service.ts` es un detalle interno de este provider: ningún
 * otro módulo debe importarlo. Las claves crudas están prohibidas — usar
 * siempre `STORE_KEYS` (el tipado lo fuerza).
 */
export const storageProvider: IStorageProvider = {
  get: async <K extends StoreKey>(
    key: K,
  ): Promise<StoreValueMap[K] | null> => {
    const value = (await getValue(key)) as StoreValueMap[K] | null;
    return value ?? null;
  },
  set: async (key, value) => {
    await setValue(key, value);
  },
  delete: async (key) => {
    await deleteValue(key);
  },
  clear: async (keys) => {
    await Promise.all(keys.map((key) => deleteValue(key)));
  },
};
