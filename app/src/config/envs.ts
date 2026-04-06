import * as z from "zod";

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_ANON_KEY: z.string().min(1),
  VITE_OPEN_WEATHER_API_KEY: z.string().min(1),
  API_URL: z.string().optional(),
});

const envVars = {
  VITE_SUPABASE_URL: "https://otvudprkslkrilfkmalz.supabase.co",
  VITE_SUPABASE_ANON_KEY:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90dnVkcHJrc2xrcmlsZmttYWx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNTI2MDcsImV4cCI6MjA3NzcyODYwN30.gzkW1xId_wb6UwKco3s2OXdvWlriB0gqGmuWbLXZ-fg",
  VITE_OPEN_WEATHER_API_KEY: "For future",
  API_URL: "https://cathub-backend.vercel.app",
};

const parsed = envSchema.parse(envVars);

export const envs = {
  supabaseUrl: parsed.VITE_SUPABASE_URL,
  supabaseAnonKey: parsed.VITE_SUPABASE_ANON_KEY,
  openWeatherApiKey: parsed.VITE_OPEN_WEATHER_API_KEY,
  apiUrl: parsed.API_URL,
};
