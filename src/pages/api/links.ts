import type { APIRoute } from "astro";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import yaml from "js-yaml";

export const GET: APIRoute = async () => {
  try {
    const root = process.cwd();
    // intenta .yaml y .yml
    const candidates = [
      join(root, "data", "links.yaml"),
      join(root, "data", "links.yml"),
    ];

    let file: string | null = null;
    let lastErr: any = null;

    for (const p of candidates) {
      try {
        file = await readFile(p, "utf8");
        if (file) break;
      } catch (e) {
        lastErr = e;
      }
    }

    if (!file) {
      return new Response(
        JSON.stringify({
          error: "No se encontró links.yaml/links.yml en /data",
          tried: candidates,
          detail: String(lastErr || ""),
        }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    const parsed = yaml.load(file);
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
