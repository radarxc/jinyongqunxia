import { describe, expect, it } from 'vitest';
import { EncounterDefSchema } from '@tianshu/data/schemas';
import { loadContent } from '@tianshu/data/tooling';
import { PROLOGUE_ENCOUNTERS, PROLOGUE_TEMPLATE } from './prologue-encounters';

const encounterFile = (value: unknown) => ({ path: 'content/chapters/ch00_yuenv/encounter.yaml',
  text: JSON.stringify(value) });
const templateFile = { path: 'content/common/templates/tmpl_normal.yaml',
  text: JSON.stringify(PROLOGUE_TEMPLATE) };

describe('encounter.v1 schema and references', () => {
  it('accepts all prologue fixtures and rejects unknown or duplicate participant refs', () => {
    for (const encounter of PROLOGUE_ENCOUNTERS)
      expect(EncounterDefSchema.parse(encounter)).toEqual(encounter);
    const unknown = structuredClone(PROLOGUE_ENCOUNTERS[0]!);
    unknown.beats[0]!.actions = [{ kind: 'switchControl', unitRef: 'missing', control: 'player' }];
    expect(() => EncounterDefSchema.parse(unknown)).toThrow('unknown unitRef missing');
    const duplicate = structuredClone(PROLOGUE_ENCOUNTERS[0]!);
    duplicate.participants[1]!.unitRef = duplicate.participants[0]!.unitRef;
    expect(() => EncounterDefSchema.parse(duplicate)).toThrow('unitRef values must be unique');
  });

  it('rejects invalid spar rules, difficulty equations and grid spans', () => {
    const spar = structuredClone(PROLOGUE_ENCOUNTERS[1]!); spar.rules.lethalIntent = true;
    expect(() => EncounterDefSchema.parse(spar)).toThrow('spar requires mercyAllowed');
    const difficulty = structuredClone(PROLOGUE_ENCOUNTERS[0]!);
    difficulty.difficulty.enemyStatBp = 9_001;
    expect(() => EncounterDefSchema.parse(difficulty)).toThrow('8500 + 500D');
    const span = structuredClone(PROLOGUE_ENCOUNTERS[0]!);
    if (span.arena.kind !== 'inline') throw new TypeError('FIXTURE_ARENA');
    const minQ = Math.min(...span.arena.cells.slice(1).map((cell) => cell.q));
    span.arena.cells[0]!.q = minQ + 20;
    expect(() => EncounterDefSchema.parse(span)).toThrow('within 20 spans');
  });

  it('indexes encounters and rejects missing NPC and template references', () => {
    const templateEncounter = PROLOGUE_ENCOUNTERS[0]!;
    const registry = loadContent([templateFile, encounterFile(templateEncounter)]);
    expect(registry.require('encounter', templateEncounter.id)).toEqual(templateEncounter);
    expect(registry.encounters).toEqual([templateEncounter]);
    expect(() => loadContent([encounterFile(templateEncounter)]))
      .toThrow('CONTENT_REF:content/chapters/ch00_yuenv/encounter.yaml:characterTemplate:tmpl_normal');
    const npcEncounter = PROLOGUE_ENCOUNTERS[1]!;
    expect(() => loadContent([encounterFile(npcEncounter)]))
      .toThrow('CONTENT_REF:content/chapters/ch00_yuenv/encounter.yaml:npc:npc_baiyuan');
  });
});
