import { describe, expect, it } from 'vitest';
import {
  CharacterTemplateBodySchema, CharacterTemplateSchema, DEFAULT_PLAYER_BODY, NpcAppearanceSchema,
  NpcDefSchema, pickTemplateHeightCm,
} from './character';

const template = {
  schemaVersion: 'character-template.v1', id: 'tmpl_normal', role: 'normal',
  innate: { con: 50, str: 50, agi: 50, wis: 50, wil: 50, luk: 50, cha: 50 },
  cultivationBand: { min: 1, max: 20, derived: true }, skillSeeds: [],
} as const;

const appearance = {
  key: 'prime', chapterId: 'ch01_song', years: { from: 1100, to: 1110, approx: true },
  displayName: '某人', presenceMode: 'living', combatEligible: false, ageBand: 'prime', sects: [],
  location: { cityId: null, placeKey: null }, contentLayer: 'commoner', recruitment: null,
  build: { pipeline: 'template', templateId: 'tmpl_normal', ageBand: 'prime',
    seedPolicy: 'stable_per_save' },
  ai: { tier: 'ai_basic', personality: 'pers_calm' },
} as const;

function mulberry32(seed: number): () => number {
  return () => {
    let value = seed += 0x6d2b79f5;
    value = Math.imul(value ^ value >>> 15, value | 1);
    value ^= value + Math.imul(value ^ value >>> 7, value | 61);
    return (value ^ value >>> 14) >>> 0;
  };
}

async function loadRenderPlayerHeights(): Promise<{ readonly male: number; readonly female: number }> {
  // Test-only oracle: a computed URL keeps render outside data's production TypeScript project.
  const moduleUrl = new URL('../../../render/src/actors/heights.ts', import.meta.url).href;
  const module = await import(/* @vite-ignore */ moduleUrl) as {
    DEFAULT_PLAYER_HEIGHT_M: { readonly male: number; readonly female: number };
  };
  return module.DEFAULT_PLAYER_HEIGHT_M;
}

describe('battle model gender data', () => {
  it('accepts optional binary gender on NPC identity and character templates', () => {
    const identity = { name: '某人', aliases: [], origin: 'expanded', species: 'human',
      sourceWorks: ['原创扩展'] };
    expect(NpcDefSchema.shape.identity.parse({ ...identity, gender: 'female' }).gender).toBe('female');
    expect(NpcDefSchema.shape.identity.parse(identity).gender).toBeUndefined();
    expect(CharacterTemplateSchema.parse({ ...template, gender: 'male' }).gender).toBe('male');
    expect(CharacterTemplateSchema.parse(template).gender).toBeUndefined();
  });

  it('rejects values outside the authored male/female contract', () => {
    expect(() => NpcDefSchema.shape.identity.parse({ name: '某人', aliases: [],
      origin: 'expanded', species: 'human', gender: 'unknown', sourceWorks: ['原创扩展'] }))
      .toThrow();
  });
});

describe('character body schemas', () => {
  it('accepts inclusive NPC height boundaries 120 and 230', () => {
    expect(NpcAppearanceSchema.parse({ ...appearance,
      body: { template: 'tpl_f_small', heightCm: 120 } }).body?.heightCm).toBe(120);
    expect(NpcAppearanceSchema.parse({ ...appearance,
      body: { template: 'tpl_m_bulk', heightCm: 230 } }).body?.heightCm).toBe(230);
  });

  it('rejects NPC heights 119 and 231 and unknown body templates', () => {
    expect(() => NpcAppearanceSchema.parse({ ...appearance,
      body: { template: 'tpl_f_small', heightCm: 119 } })).toThrow();
    expect(() => NpcAppearanceSchema.parse({ ...appearance,
      body: { template: 'tpl_f_small', heightCm: 231 } })).toThrow();
    expect(() => NpcAppearanceSchema.parse({ ...appearance,
      body: { template: 'tpl_unknown', heightCm: 166 } })).toThrow();
  });

  it('accepts an ordered template body range at both height limits', () => {
    const parsed = CharacterTemplateSchema.parse({ ...template, body: {
      templates: ['tpl_f_small', 'tpl_m_bulk'], heightCm: [120, 230],
    } });
    expect(parsed.body).toEqual({
      templates: ['tpl_f_small', 'tpl_m_bulk'], heightCm: [120, 230],
    });
  });

  it('rejects empty, duplicate, unknown, or reversed template body data', () => {
    expect(() => CharacterTemplateSchema.parse({ ...template,
      body: { templates: [], heightCm: [120, 230] } })).toThrow();
    expect(() => CharacterTemplateSchema.parse({ ...template,
      body: { templates: ['tpl_f_small', 'tpl_f_small'], heightCm: [120, 230] } })).toThrow();
    expect(() => CharacterTemplateSchema.parse({ ...template,
      body: { templates: ['tpl_unknown'], heightCm: [120, 230] } })).toThrow();
    expect(() => CharacterTemplateSchema.parse({ ...template,
      body: { templates: ['tpl_f_small'], heightCm: [181, 180] } })).toThrow();
    expect(() => CharacterTemplateSchema.parse({ ...template,
      body: { templates: ['tpl_f_small'], heightCm: [119, 230] } })).toThrow();
    expect(() => CharacterTemplateSchema.parse({ ...template,
      body: { templates: ['tpl_f_small'], heightCm: [120, 231] } })).toThrow();
  });
});

describe('pickTemplateHeightCm', () => {
  const body = CharacterTemplateBodySchema.parse({
    templates: ['tpl_f_small', 'tpl_f_medium', 'tpl_m_lean'], heightCm: [158, 186],
  });

  it('returns the same template and height for the same seed', () => {
    expect(pickTemplateHeightCm(body, 0x1234_5678))
      .toEqual(pickTemplateHeightCm(body, 0x1234_5678));
  });

  it('splits the seed between template selection and height selection', () => {
    expect(pickTemplateHeightCm(body, 100))
      .toEqual({ template: 'tpl_f_medium', heightCm: 162 });
  });

  it('keeps 10,000 fixed mulberry32 seeds within the authored body domain', () => {
    const nextSeed = mulberry32(0x6d2b_79f5);
    for (let index = 0; index < 10_000; index += 1) {
      const picked = pickTemplateHeightCm(body, nextSeed());
      expect(body.templates).toContain(picked.template);
      expect(picked.heightCm).toBeGreaterThanOrEqual(158);
      expect(picked.heightCm).toBeLessThanOrEqual(186);
    }
  });

  it('keeps a one-centimetre range at its sole value', () => {
    const fixed = CharacterTemplateBodySchema.parse({
      templates: ['tpl_m_medium'], heightCm: [181, 181],
    });
    expect(pickTemplateHeightCm(fixed, 0)).toEqual({ template: 'tpl_m_medium', heightCm: 181 });
    expect(pickTemplateHeightCm(fixed, 0xffff_ffff).heightCm).toBe(181);
  });

  it('rejects negative, fractional, and above-uint32 seeds', () => {
    expect(() => pickTemplateHeightCm(body, -1)).toThrow('BODY_SEED_UINT32_REQUIRED');
    expect(() => pickTemplateHeightCm(body, 1.5)).toThrow('BODY_SEED_UINT32_REQUIRED');
    expect(() => pickTemplateHeightCm(body, 0x1_0000_0000)).toThrow('BODY_SEED_UINT32_REQUIRED');
  });

  it('exports the AR-104 player defaults and matches the render metre constants', async () => {
    expect(DEFAULT_PLAYER_BODY).toEqual({
      male: { template: 'tpl_m_medium', heightCm: 181 },
      female: { template: 'tpl_f_medium', heightCm: 166 },
    });
    expect({
      male: DEFAULT_PLAYER_BODY.male.heightCm / 100,
      female: DEFAULT_PLAYER_BODY.female.heightCm / 100,
    }).toEqual(await loadRenderPlayerHeights());
  });
});
