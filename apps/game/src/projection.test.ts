import { describe, expect, it } from 'vitest';
import { createSelectors } from './projection';
import { createPreviewSession } from './runtime/bootstrap';
import { ALL_VIEWS } from './runtime/contracts';
import { fixtureContent } from './runtime/test-fixture';

describe('incremental UI projections', () => {
  const content = fixtureContent();
  it('copies rule stats, converts the calendar, and redacts unknown NPCs before transport', () => {
    const session = createPreviewSession(content);
    const selectors = createSelectors(content);
    selectors.update(session, ALL_VIEWS);
    const view = selectors.query();
    expect(view.hud).toMatchObject({ hp: { current: 342, maximum: 342 }, mp: { maximum: 200 }, date: '1093年 1月 1日 子时', action: null });
    expect(view.characters.find((row) => row.relation === 'unseen')).toMatchObject({ name: '未遇之人', portrait: null, detail: null });
    expect(JSON.stringify(view.characters)).not.toContain('npc_xiaofeng');
    expect(JSON.stringify(view.characters)).not.toContain('萧峰');
    expect(view.equipment).toHaveLength(11);
    expect(view).not.toHaveProperty('state');
  });
  it('reuses clean list references and never returns mutable character state', () => {
    const session = createPreviewSession(content);
    const selectors = createSelectors(content);
    selectors.update(session, ALL_VIEWS);
    const original = selectors.query();
    const patch = selectors.update(session, ['hud']);
    expect(patch).not.toHaveProperty('inventory');
    expect(patch).not.toHaveProperty('characters');
    expect(selectors.query().inventory).toBe(original.inventory);
    expect(selectors.query().characters).toBe(original.characters);
    expect(selectors.query().hud).not.toBe(original.hud);
    expect(original.characters[0]?.detail?.stats).not.toBe(session.state.profile.protagonist?.stats);
  });
  it('projects open nodes and their actual strength without granting closed nodes', () => {
    const session = createPreviewSession(content);
    const protagonist = session.state.profile.protagonist!;
    const character = { ...protagonist, meridians: { ...protagonist.meridians,
      opened: ['ap_shoutaiyin_zhongfu'],
      acupointStats: { ap_shoutaiyin_zhongfu: { grade: 3, strengthLayer: 4, strengthXp: 0, fluxCap: 8 } } } };
    const selectors = createSelectors(content);
    selectors.update({ ...session, state: { ...session.state, profile: { protagonist: character, companions: [] } } }, ALL_VIEWS);
    const points = selectors.query().characters[0]?.detail?.meridians[0]?.points;
    expect(points?.[0]).toMatchObject({ opened: true, grade: 3, strength: 4, flux: 8 });
    expect(points?.[1]).toMatchObject({ opened: false, grade: null, strength: null });
  });
});
