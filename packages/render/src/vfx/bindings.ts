import type { ResolvedMoveVfx, VfxBinding, VfxNature, VfxTemplateMode } from './types';

export const VFX_COLORS = { yin: '#5FB5B0', yang: '#D9483B', harmony: '#E8D6A3', neutral: '#F4F4F4' } as const;
const MOVE_ID = /^mv_[a-z0-9]+(?:_[a-z0-9]+)*$/;
const SAFE_SUITE = /^assets\/default\/vfx\/sk_[a-z0-9_]+\/moves\/mv_[a-z0-9_]+\/$/;
const warned = new Set<string>();
type Exists = (url: string) => Promise<boolean>;
type Warn = (message: string) => void;

export function createBindingIndex(rows: readonly VfxBinding[]): ReadonlyMap<string, VfxBinding> {
  const index = new Map<string, VfxBinding>();
  for (const row of rows) {
    if (!MOVE_ID.test(row.move) || !/^sk_[a-z0-9_]+$/.test(row.skill) ||
      (row.mode === 'bespoke' && (!row.suite || !SAFE_SUITE.test(row.suite))) ||
      (row.mode === 'template' && !['qi_projection', 'afterimage', 'plain_strike'].includes(row.template ?? '')))
      throw new Error(`Invalid VFX binding: ${row.move}`);
    if (index.has(row.move)) throw new Error(`Duplicate VFX binding: ${row.move}`);
    index.set(row.move, row);
  }
  return index;
}

function fallback(moveId: string, nature: VfxNature, binding: VfxBinding | null,
  reason: NonNullable<ResolvedMoveVfx['reason']>, warn: Warn): ResolvedMoveVfx {
  const key = `${moveId}:${reason}`;
  if (!warned.has(key)) { warned.add(key); warn(`[VFX] ${moveId} uses plain_strike fallback (${reason})`); }
  return { binding, mode: 'plain_strike', color: VFX_COLORS[nature], durationMs: 320, fallback: true, reason };
}

export function templateDuration(mode: VfxTemplateMode, binding?: VfxBinding): number {
  const configured = binding?.params['duration_s'];
  if (Number.isFinite(configured) && configured! > 0) return configured! * 1000;
  return { qi_projection: 600, afterimage: 480, plain_strike: 320 }[mode];
}

export async function resolveMoveVfx(index: ReadonlyMap<string, VfxBinding>, moveId: string,
  actorNature?: VfxNature, exists?: Exists, warn: Warn = console.warn): Promise<ResolvedMoveVfx> {
  const binding = index.get(moveId);
  if (!binding) return fallback(moveId, actorNature ?? 'neutral', null, 'binding-missing', warn);
  const nature = actorNature ?? binding.nature;
  if (binding.mode === 'template') {
    const mode = binding.template!;
    return { binding, mode, color: VFX_COLORS[nature], durationMs: templateDuration(mode, binding), fallback: false };
  }
  const compositionUrl = `/${binding.suite}composition.json`;
  if (exists && !await exists(compositionUrl))
    return fallback(moveId, nature, binding, 'composition-missing', warn);
  return { binding, mode: 'bespoke', compositionUrl, color: VFX_COLORS[nature], durationMs: 600, fallback: false };
}

export function resetVfxWarningsForTest(): void { warned.clear(); }
