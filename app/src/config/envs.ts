import * as z from "zod";

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_ANON_KEY: z.string().min(1),
  VITE_OPEN_WEATHER_API_KEY: z.string().min(1),
});

const parsed = envSchema.parse(import.meta.env);

export const envs = {
  supabaseUrl: parsed.VITE_SUPABASE_URL,
  supabaseAnonKey: parsed.VITE_SUPABASE_ANON_KEY,
  openWeatherApiKey: parsed.VITE_OPEN_WEATHER_API_KEY,
};
