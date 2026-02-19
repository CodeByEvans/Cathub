// services/store.service.ts
import { load, Store } from "@tauri-apps/plugin-store";

let store: Store | null = null;

export async function getStore() {
  if (!store) store = await load("store.json");
  return store;
}

export async function setValue(key: string, value: any): Promise<string> {
  try {
    const storeInstance = await getStore();
    if (!storeInstance) throw new Error("Store no inicializada");
    await storeInstance.set(key, value);
    await storeInstance.save();
    return value;
  } catch (error) {
    // ✅ Paréntesis NORMALES, no backticks
    console.error(`Error guardando clave ${key} en store:`, error);
    throw new Error(`No se pudo guardar la clave ${key}`);
  }
}

export async function getValue(key: string): Promise<string | null> {
  const storeInstance = await getStore();
  if (!storeInstance) throw new Error("Store no inicializada");
  const value = await storeInstance.get<string>(key);
  return value ?? null;
}

export async function deleteValue(key: string): Promise<void> {
  const storeInstance = await getStore();
  if (!storeInstance) throw new Error("Store no inicializada");
  await storeInstance.delete(key);
  await storeInstance.save();
}

export async function clearStore(): Promise<void> {
  const storeInstance = await getStore();
  if (!storeInstance) throw new Error("Store no inicializada");
  await storeInstance.clear();
  await storeInstance.save();
}

export async function hasValue(key: string): Promise<boolean> {
  const storeInstance = await getStore();
  if (!storeInstance) throw new Error("Store no inicializada");
  const value = await storeInstance.get(key);
  return value !== null && value !== undefined;
}
