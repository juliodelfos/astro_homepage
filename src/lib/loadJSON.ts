/** Fetch con logs detallados para usar en el cliente (browser). */
export async function loadJSON(path: string) {
  try {
    const url = new URL(path, window.location.origin).toString();
    const res = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
      credentials: "same-origin",
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("[UI] Fetch not OK", { url, status: res.status, text });
      throw new Error(`HTTP ${res.status} :: ${text.slice(0, 300)}`);
    }
    return await res.json();
  } catch (err: any) {
    console.error("[UI] Fetch error", err);
    return { __error: String(err?.message || err) };
  }
}
