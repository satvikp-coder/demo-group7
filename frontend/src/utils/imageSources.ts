import manifest from "../../public/assets/photographs/manifest.json";

export interface PhotoCredit {
  path: string;
  title: string;
  author: string;
  source: string;
  license: string;
  licenseUrl: string;
  changes: string;
}
export const photoCredits: PhotoCredit[] = manifest.photos;

/** Resolve assets against Vite's base, never against a nested page or API URL. */
export function imageSource(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) return "";
  const aliases = manifest.aliases as Record<string,string>;
  const source = aliases[value.trim()] || value.trim();
  if (/^https?:\/\//i.test(source)) {
    try {
      const url = new URL(source);
      return url.username || url.password ? "" : url.href;
    } catch { return ""; }
  }
  // Accept only public image paths. Refuse schemes, protocol-relative URLs and traversal.
  const path = source.replace(/^\.\//, "").replace(/^\//, "");
  if (!/^(?:assets|images)\/[a-z0-9/_ .-]+\.(?:svg|png|jpe?g|webp|avif|gif)$/i.test(path)
    || path.split("/").some(part => part === ".." || part === ".")) return "";
  return (import.meta.env?.BASE_URL || "/") + path;
}

export function catalogPhoto(kind: string, row: Record<string, unknown>): string {
  const mappings = manifest.records as Record<string, string>;
  const names = manifest.names as Record<string,string>;
  const local = typeof row.slug === "string" ? mappings[kind + ":" + row.slug]
    : typeof row.name === "string" ? names[kind + ":" + row.name] : undefined;
  const supplied = imageSource(row.image_url || row.imageUrl || row.photoUrl || row.thumbnail);
  // Curated local photos are presentation assets; database provenance stays untouched.
  // An operator can supply a photo for a previously missing record. Never confuse a
  // different slug with a similarly named property when resolving new records.
  return (local && !local.includes("/categories/") ? imageSource(local) : supplied || imageSource(local))
    || imageSource("/assets/categories/" + (({hotels:"hotel",restaurants:"dining"} as Record<string,string>)[kind] || "monument") + ".svg");
}

export function photoCredit(source: string): PhotoCredit | undefined {
  return photoCredits.find(photo => imageSource(photo.path) === source);
}

export const emergencyImage = "data:image/svg+xml," + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">'
  + '<rect width="600" height="400" fill="#141E34"/><rect x="20" y="20" width="560" height="360" fill="none" stroke="#C99A3B"/>'
  + '<path d="M250 235V155h100v80M270 235v-45q30-30 60 0v45M240 155l60-35 60 35" fill="none" stroke="#C99A3B" stroke-width="4"/>'
  + '<text x="300" y="290" text-anchor="middle" fill="#F6F4EF" font-family="serif" font-size="18">Photograph unavailable</text>'
  + '<text x="300" y="315" text-anchor="middle" fill="#C99A3B" font-family="monospace" font-size="12">Generic heritage illustration</text></svg>'
);
