export interface ExtractedMeridian {
  readonly id: string; readonly name: string;
  readonly points: readonly { readonly id: string; readonly name: string }[];
}

/** One-time migration parser. Production builds consume only the checked-in YAML. */
export function extractMeridianTopology(markdown: string): readonly ExtractedMeridian[] {
  const catalog = markdown.slice(markdown.indexOf('## 2.'), markdown.indexOf('## 3.'));
  const points = markdown.slice(markdown.indexOf('## 3.'), markdown.indexOf('## 4.'));
  const result: { id: string; name: string; points: { id: string; name: string }[] }[] = [];
  for (const match of catalog.matchAll(/^\| `(mer_[a-z0-9_]+)` \| ([^|]+) \|/gmu))
    if (!result.some((entry) => entry.id === match[1]))
      result.push({ id: match[1]!, name: match[2]!.trim(), points: [] });
  let current: (typeof result)[number] | undefined;
  for (const line of points.split('\n')) {
    const header = line.match(/^### 3\.\d+ .+`(mer_[a-z0-9_]+)`/u);
    if (header) current = result.find((entry) => entry.id === header[1]);
    const point = line.match(/^\| \d+ \| `(ap_[a-z0-9_]+)` \| ([^|]+) \|/u);
    if (current && point) current.points.push({ id: point[1]!, name: point[2]!.trim() });
  }
  return result;
}

export function extractSectCatalog(markdown: string): readonly { id: string; name: string }[] {
  const result: { id: string; name: string }[] = [];
  for (const match of markdown.matchAll(/^\| `(sect_[a-z0-9_]+)` \| ([一-鿿][^|]+) \|/gmu))
    if (!result.some((entry) => entry.id === match[1]))
      result.push({ id: match[1]!, name: match[2]!.trim().replace(/\*|`/gu, '') });
  return result;
}
