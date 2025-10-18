import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";

export const GET: APIRoute = async () => {
  // ✅ Usa import.meta.env en lugar de Astro.env
  const SUPABASE_URL = import.meta.env.SUPABASE_URL;
  const SUPABASE_KEY = import.meta.env.SUPABASE_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return new Response(
      JSON.stringify({ error: "Faltan SUPABASE_URL o SUPABASE_KEY" }),
      { status: 500 },
    );
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false },
  });

  // Resto de tu código...
  const now = new Date();

  const dayStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const dayEnd = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1),
  );

  const dow = (now.getUTCDay() + 6) % 7; // lunes = 0
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
      JSON.stringify({ error: errors.map((e) => e!.message).join(" | ") }),
      { status: 500 },
    );
  }

  return new Response(
    JSON.stringify({
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
    }),
    {
      headers: { "Content-Type": "application/json" },
    },
  );
};
