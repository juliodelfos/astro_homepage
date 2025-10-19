import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";

// En dev, asegura que .env se cargue a process.env (no afecta prod):
import "dotenv/config";

export const GET: APIRoute = async () => {
  // Runtime primero (Coolify/prod), fallback a build (dev/Vite)
  const SUPABASE_URL = process.env.SUPABASE_URL ?? import.meta.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_KEY ?? import.meta.env.SUPABASE_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return new Response(
      JSON.stringify({
        error:
          "Faltan variables SUPABASE_URL o SUPABASE_KEY (revisa Coolify y/o tu .env en dev).",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
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

    const dow = (now.getUTCDay() + 6) % 7; // lunes=0
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
      return new Response(
        JSON.stringify({
          error: errors.map((e) => e!.message).join(" | "),
        }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({
        month: {
          label: now.toLocaleString("es-CL", {
            month: "long",
            year: "numeric",
          }),
          total: monthQ.count ?? 0,
        },
        week: {
          label: `${weekStart.toISOString().slice(0, 10)} → ${new Date(
            weekEnd.getTime() - 1,
          )
            .toISOString()
            .slice(0, 10)}`,
          total: weekQ.count ?? 0,
        },
        day: {
          label: dayStart.toISOString().slice(0, 10),
          total: dayQ.count ?? 0,
        },
      }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: e?.message || "Error consultando Supabase" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};
