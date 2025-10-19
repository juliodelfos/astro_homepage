import type { APIRoute } from "astro";
import yaml from "js-yaml";
// Ajusta la ruta si tu `data/` está en otro nivel:
import linksRaw from "../../../data/links.yaml?raw";

const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "Access-Control-Allow-Origin": "*",
};

export const GET: APIRoute = async () => {
  try {
    if (!linksRaw) {
      const msg = "links.yaml no fue incluido en el bundle (?raw).";
      console.error("[/api/links] BUNDLE ERROR:", msg);
      return new Response(JSON.stringify({ error: msg }), {
        status: 500,
        headers: JSON_HEADERS,
      });
    }
    const parsed = yaml.load(linksRaw as string);
    if (!parsed || typeof parsed !== "object") {
      const msg = "links.yaml inválido o vacío.";
      console.error("[/api/links] PARSE ERROR:", msg);
      return new Response(JSON.stringify({ error: msg }), {
        status: 500,
        headers: JSON_HEADERS,
      });
    }
    return new Response(JSON.stringify(parsed), { headers: JSON_HEADERS });
  } catch (e: any) {
    console.error("[/api/links] UNHANDLED:", e);
    return new Response(JSON.stringify({ error: e?.message ?? "Unhandled" }), {
      status: 500,
      headers: JSON_HEADERS,
    });
  }
};
