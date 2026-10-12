const SPEC_LAYOUT = /([a-z][a-z0-9_]*__ch\d{2})\.ya?ml$/u;

/**
 * Facility and shop layout identity of a compiled town runtime. The compiler records the authored
 * design spec (`source.spec` = `docs/design/town/<cityId>__<chapterId>.yaml`); that name survives
 * a chapter reusing another chapter's runtime under its own identity (the dev build's borrowed
 * towns rewrite `cityId` and `chapterId` but keep `source`). Without a recognisable spec, fall back
 * to `<cityId>__<chapterId>`.
 */
export function townLayoutKey(town: {
  readonly cityId: string;
  readonly chapterId: string;
  readonly source?: { readonly spec?: string };
}): string {
  const match = SPEC_LAYOUT.exec(town.source?.spec ?? '');
  return match?.[1] ?? `${town.cityId}__${town.chapterId}`;
}
