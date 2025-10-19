import type { APIRoute } from "astro";
// En dev carga .env; en prod no afecta
try {
  await import("dotenv/config");
} catch {}

export const GET: APIRoute = async () => {
  const get = (k: string) =>
    process.env[k] ?? (import.meta as any)?.env?.[k] ?? null;

  const env = {
    NODE_ENV: get("NODE_ENV"),
    PORT: get("PORT"),
    HOST: get("HOST"),
    SUPABASE_URL_present: !!get("SUPABASE_URL"),
    SUPABASE_KEY_present: !!get("SUPABASE_KEY"),
  };

  return new Response(
    JSON.stringify(
      {
        ok: env.SUPABASE_URL_present && env.SUPABASE_KEY_present,
        env,
        time: new Date().toISOString(),
      },
      null,
      2,
    ),
    {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
};
