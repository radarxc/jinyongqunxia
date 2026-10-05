import { describe, expect, it } from 'vitest';
import { CharacterTemplateSchema, NpcDefSchema } from './character';

describe('battle model gender data', () => {
  it('accepts optional binary gender on NPC identity and character templates', () => {
    const identity = { name: '某人', aliases: [], origin: 'expanded', species: 'human',
      sourceWorks: ['原创扩展'] };
    const template = { schemaVersion: 'character-template.v1', id: 'tmpl_normal', role: 'normal',
      innate: { con: 50, str: 50, agi: 50, wis: 50, wil: 50, luk: 50, cha: 50 },
      cultivationBand: { min: 1, max: 20, derived: true }, skillSeeds: [] };
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
