import { IStorageProvider } from "@/interfaces/IStorageProvider";
import { getValue, setValue } from "@/services/store.service";

export const storageProvider: IStorageProvider = {
  get: async (key) => {
    const v = await getValue(key);
    return typeof v === "string" ? v : null;
  },
  set: async (key, value) => {
    await setValue(key, value);
  },
};
