import type { APIRoute } from "astro";
import yaml from "js-yaml";
// importa el archivo al bundle (no dependes de rutas del FS en runtime)
import linksRaw from "../../../data/links.yaml?raw";

export const GET: APIRoute = async () => {
  try {
    const parsed = yaml.load(linksRaw);
    if (!parsed || typeof parsed !== "object") {
      return new Response(JSON.stringify({ error: "links.yaml inválido" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify(parsed), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: e?.message || "Error leyendo YAML" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
