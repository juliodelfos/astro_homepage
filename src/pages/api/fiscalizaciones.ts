import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";
// En dev, si tienes dotenv:
try {
  await import("dotenv/config");
} catch {}

const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "Access-Control-Allow-Origin": "*",
};

export const GET: APIRoute = async () => {
  const fromEnv = (k: string) =>
    process.env[k] ?? (import.meta as any).env?.[k];
  const SUPABASE_URL = fromEnv("SUPABASE_URL");
  const SUPABASE_KEY = fromEnv("SUPABASE_KEY");

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    const msg =
      `Faltan variables: ${!SUPABASE_URL ? "SUPABASE_URL " : ""}${!SUPABASE_KEY ? "SUPABASE_KEY" : ""}`.trim();
    console.error("[/api/fiscalizaciones] ENV ERROR:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: JSON_HEADERS,
    });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false },
  });

  try {
    const now = new Date();
    const dayStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );
    const dayEnd = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1),
    );
    const dow = (now.getUTCDay() + 6) % 7;
    const weekStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - dow),
    );
    const weekEnd = new Date(
      Date.UTC(
        weekStart.getUTCFullYear(),
        weekStart.getUTCMonth(),
        weekStart.getUTCDate() + 7,
      ),
    );
    const monthStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
    );
    const monthEnd = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
    );
    const iso = (d: Date) => d.toISOString();

    const [dayQ, weekQ, monthQ] = await Promise.all([
      supabase
        .from("fiscalizacion")
        .select("*", { count: "exact", head: true })
        .gte("timestamp", iso(dayStart))
        .lt("timestamp", iso(dayEnd)),
      supabase
        .from("fiscalizacion")
        .select("*", { count: "exact", head: true })
        .gte("timestamp", iso(weekStart))
        .lt("timestamp", iso(weekEnd)),
      supabase
        .from("fiscalizacion")
        .select("*", { count: "exact", head: true })
        .gte("timestamp", iso(monthStart))
        .lt("timestamp", iso(monthEnd)),
    ]);

    const errors = [dayQ.error, weekQ.error, monthQ.error].filter(Boolean);
    if (errors.length) {
      const msg = errors.map((e) => e!.message).join(" | ");
      console.error("[/api/fiscalizaciones] QUERY ERROR:", msg);
      return new Response(JSON.stringify({ error: msg }), {
        status: 500,
        headers: JSON_HEADERS,
      });
    }

    const payload = {
      month: {
        label: now.toLocaleString("es-CL", { month: "long", year: "numeric" }),
        total: monthQ.count ?? 0,
      },
      week: {
        label: `${weekStart.toISOString().slice(0, 10)} → ${new Date(weekEnd.getTime() - 1).toISOString().slice(0, 10)}`,
        total: weekQ.count ?? 0,
      },
      day: {
        label: dayStart.toISOString().slice(0, 10),
        total: dayQ.count ?? 0,
      },
    };
    return new Response(JSON.stringify(payload), { headers: JSON_HEADERS });
  } catch (e: any) {
    console.error("[/api/fiscalizaciones] UNHANDLED:", e);
    return new Response(JSON.stringify({ error: e?.message ?? "Unhandled" }), {
      status: 500,
      headers: JSON_HEADERS,
    });
  }
};
