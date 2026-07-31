import { load, Store } from "@tauri-apps/plugin-store";
import { AppError } from "@/shared/errors/AppError";

let store: Store | null = null;

async function getStore() {
  if (!store) store = await load("store.json");
  return store;
}

/**
 * ⚠️ Detalle interno de `shared/infrastructure/storage.provider.ts`.
 * No importar este archivo desde ningún otro módulo.
 */
export async function setValue(key: string, value: unknown): Promise<void> {
  try {
    const storeInstance = await getStore();
    await storeInstance.set(key, value);
    await storeInstance.save();
  } catch (error) {
    throw new AppError("store/write-failed", {
      message: `No se pudo guardar la clave ${key}`,
      cause: error,
    });
  }
}

/** ⚠️ Detalle interno de `storage.provider` — no importar desde otros módulos. */
export async function getValue(key: string): Promise<unknown> {
  const storeInstance = await getStore();
  const value = await storeInstance.get<unknown>(key);
  return value ?? null;
}

/** ⚠️ Detalle interno de `storage.provider` — no importar desde otros módulos. */
export async function deleteValue(key: string): Promise<void> {
  const storeInstance = await getStore();
  await storeInstance.delete(key);
  await storeInstance.save();
}
