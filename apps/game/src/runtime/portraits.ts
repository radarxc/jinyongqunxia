import { ref, watchEffect, type Ref } from 'vue';

/** npcId → cutout full-body portrait, published by build/asset-manifest.ts. */
const INDEX_URL = '/assets/default/portrait/index.json';
const PLAYER_PORTRAIT = '/img/hero_cutout.png';
/** Speakers that should never show a figure (narration, the book spirit voice). */
const NO_PORTRAIT = new Set(['narrator', 'npc_shuling', 'book_spirit']);

let pending: Promise<Readonly<Record<string, string>>> | null = null;

function loadIndex(): Promise<Readonly<Record<string, string>>> {
  pending ??= fetch(INDEX_URL)
    .then((response) => (response.ok ? response.json() as Promise<Record<string, string>> : {}))
    .catch(() => ({}));
  return pending;
}

/**
 * Synchronous resolver once the index is loaded — for renderers that need a URL per actor id.
 * `'player'` maps to the protagonist cutout.
 */
export async function loadPortraitResolver(): Promise<(actorId: string) => string | null> {
  const index = await loadIndex();
  const roles = Object.keys(index).filter((key) => key.startsWith('role_')).sort()
    .map((key) => index[key]!);
  return (actorId) => {
    if (actorId === 'player' || actorId === 'hero') return PLAYER_PORTRAIT;
    if (NO_PORTRAIT.has(actorId)) return null;
    const direct = index[actorId] ?? index[actorId.replace(/__.*$/u, '')];
    if (direct) return direct;
    // Unnamed townsfolk borrow a stable commoner cutout so nobody walks the street invisible.
    if (!roles.length) return null;
    let hash = 0; for (const char of actorId) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
    return roles[hash % roles.length] ?? null;
  };
}

export async function portraitFor(speakerId: string | null | undefined): Promise<string | null> {
  if (!speakerId || NO_PORTRAIT.has(speakerId)) return null;
  if (speakerId === 'player' || speakerId === 'hero') return PLAYER_PORTRAIT;
  const index = await loadIndex();
  const id = speakerId.startsWith('npc_') || speakerId.startsWith('role_') ? speakerId : `npc_${speakerId}`;
  return index[id] ?? index[id.replace(/__.*$/u, '')] ?? null;
}

/** Reactive variant for templates; resolves to null while loading or when no cutout exists. */
export function usePortrait(speakerId: () => string | null | undefined): Ref<string | null> {
  const url = ref<string | null>(null);
  watchEffect((onCleanup) => {
    let live = true;
    onCleanup(() => { live = false; });
    const id = speakerId();
    void portraitFor(id).then((value) => { if (live) url.value = value; });
  });
  return url;
}
