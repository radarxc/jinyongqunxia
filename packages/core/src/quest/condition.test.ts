import type { JsonValue } from '@tianshu/shared';
import type { StoryLine } from '@tianshu/data/schemas';
import { describe, expect, it } from 'vitest';
import { TICKS_PER_YEAR } from '../state';
import { compileCondition } from './condition';
import { deriveStoryFacts } from './runtime-state';
import type { StoryRuntimeSnapshot } from './runtime-models';

describe('compileCondition', () => {
  it('precompiles boolean composition and supported facts', () => {
    const program = compileCondition({ all: [
      { flag: { id: 'fl_ready', is: true } },
      { not: { quest: { id: 'q_01_main_c_01', state: 'failed' } } },
      { any: [
        { npc: { id: 'npc_duanyu', state: 'alive' } },
        { storyNode: { lineId: 'main', nodeId: 'n_wake', state: 'completed' } },
      ] },
    ] });
    expect(program({ flags: { fl_ready: true }, quests: { q_01_main_c_01: 'active' },
      npcStates: { npc_duanyu: 'alive' } })).toBe(true);
    expect(program({ flags: { fl_ready: false } })).toBe(false);
  });

  it('rejects malformed or unsupported expressions during compilation', () => {
    for (const expression of [{}, { all: [] }, { mystery: {} },
      { flag: { id: 'fl_ready', is: 'yes' } }] as JsonValue[]) {
      expect(() => compileCondition(expression)).toThrow();
    }
  });

  it('compiles scalar, inventory, quest-stage, NPC, sect and companion facts', () => {
    const program = compileCondition({ all: [
      { compare: { left: { stat: 'morality' }, op: 'ge', right: 40 } },
      { compare: { left: { art: 'chess' }, op: 'eq', right: 60 } },
      { compare: { left: { counter: 'cnt_fixture' }, op: 'gt', right: 1 } },
      { hasItem: { id: 'it_xuantieling', count: 1 } },
      { quest: { id: 'q_01_main_c_90', state: 'active', stage: 'st_help' } },
      { sect: { id: 'sect_shaolin', status: 'member', rankAtLeast: 2, contributionAtLeast: 300 } },
      { npc: { id: 'npc_xuzhu', state: 'alive', affinityAtLeast: 20, bondAtLeast: 40 } },
      { companion: { id: 'npc_xuzhu', station: 'active', everRecruited: true } },
    ] });
    expect(program({ stats: { morality: 40 }, arts: { chess: 60 }, counters: { cnt_fixture: 2 },
      inventory: { it_xuantieling: 1 }, quests: { q_01_main_c_90: { state: 'active', stage: 'st_help' } },
      sects: { sect_shaolin: { status: 'member', rank: 2, contribution: 300 } },
      npcStates: { npc_xuzhu: 'alive' }, npcRelationships: { npc_xuzhu: {
        affinity: 20, bond: 40, resentment: 0 } },
      companions: { npc_xuzhu: { station: 'active', everRecruited: true } },
    })).toBe(true);
  });

  it('compiles time, location, event, legacy and estate domain predicates', () => {
    const program = compileCondition({ all: [
      { time: { yearMin: 1093, yearMax: 1094, period: 'night' } },
      { location: { regionId: 'rg_dali_cangshan', cityId: 'city_dali', eraLayer: 'ch01' } },
      { event: { name: 'companionRejoined', npcId: 'npc_zhaobanshan' } },
      { legacy: { sourceId: 'lgs_yuenv_aqing', field: 'fragmentCount', op: 'ge', value: 1 } },
      { legacyCache: { cacheId: 'cache_yuenv_ruoye', field: 'state', op: 'eq', value: 'opened' } },
      { estate: { kind: 'resource_point_state', pointRef: 'rp_fixture_mine_07',
        ownership: 'owned', minLevel: 2 } },
      { estate: { kind: 'servant_available', servantRef: 'sv_fixture_guard_07', minLoyalty: 40 } },
      { estate: { kind: 'job_duty_ratio_at_least', contractId: 'contract_fixture_08_90', ratio: 1 } },
    ] });
    expect(program({ time: { year: 1093, period: 'night' },
      location: { regionId: 'rg_dali_cangshan', cityId: 'city_dali', eraLayer: 'ch01' },
      event: { name: 'companionRejoined', fields: { npcId: 'npc_zhaobanshan' } },
      legacySources: { lgs_yuenv_aqing: { status: 'active', fragmentCount: 1,
        hasKeystone: false, localMisses: 0 } },
      legacyCaches: { cache_yuenv_ruoye: { state: 'opened', progress: 100 } },
      estate: { resourcePoints: { rp_fixture_mine_07: { ownership: 'owned', level: 2 } },
        servants: [{ servantRef: 'sv_fixture_guard_07', loyalty: 40,
          specialties: {}, available: true }], jobs: [{ contractId: 'contract_fixture_08_90',
          jobRef: 'job_xingjiao', businessRef: 'biz_fixture_08_escort_01',
          active: true, dutyRatioBp: 10_000 }] },
    })).toBe(true);
  });

  it('rejects bad field sets and missing referenced runtime facts', () => {
    for (const expression of [
      { compare: { left: { art: 'cooking' }, op: 'ge', right: 1 } },
      { quest: { id: 'q_01_main_c_01', state: 'unknown' } },
      { location: { eraLayer: 'ch01', typo: 'x' } },
      { legacy: { sourceId: 'lgs_yuenv_aqing', field: 'status', op: 'ge', value: 'active' } },
      { estate: { kind: 'mystery' } },
    ] as JsonValue[]) expect(() => compileCondition(expression)).toThrow();
    expect(() => compileCondition({ hasItem: { id: 'it_xuantieling', count: 1 } })({}))
      .toThrow('CONDITION_FACT_MISSING');
  });

  it('projects live NPC relationship facts over host-provided values', () => {
    const snapshot = { nowTick: 0, facts: { npcRelationships: { npc_duanyu: {
      affinity: -1, bond: 0, resentment: 99 } } }, lines: [],
      npc: { presences: [], relationships: [{ npcId: 'npc_duanyu', affinity: 30,
        bond: 40, resentment: 2 }] } } as unknown as StoryRuntimeSnapshot;
    expect(compileCondition({ npc: { id: 'npc_duanyu', state: 'alive', bondAtLeast: 40 } })(
      { ...deriveStoryFacts(snapshot), npcStates: { npc_duanyu: 'alive' } },
    )).toBe(true);
  });

  it('covers every estate predicate variant', () => {
    const facts = { estate: {
      resources: [{ resourceRef: 'res_iron', quantity: 3, scope: 'bag' as const }],
      businessRelations: { biz_test: 20 }, jobs: [{ contractId: 'contract_test',
        jobRef: 'job_test', businessRef: 'biz_test', active: true, dutyRatioBp: 7_500 }],
      keqingSlotFree: true, freeSchedule: [{ day: 2, blocks: ['zi', 'chou'] }],
      validSacrificeQuotes: { quote_test: 'rp_test' },
      activeExcavationOrders: { order_test: 'cache_test' },
      membershipRanks: { sect_shaolin: 3 }, budgetRemaining: { quest: 500 },
    } };
    const conditions = [
      { kind: 'resource_at_least', resourceRef: 'res_iron', quantity: 2, scope: 'bag' },
      { kind: 'business_relation_at_least', businessRef: 'biz_test', value: 20 },
      { kind: 'job_active', jobRef: 'job_test', businessRef: 'biz_test' },
      { kind: 'keqing_slot_free' }, { kind: 'schedule_blocks_free', day: 2, blocks: ['zi'] },
      { kind: 'estate_sacrifice_quote_valid', quoteId: 'quote_test', pointRef: 'rp_test' },
      { kind: 'legacy_excavation_order_active', orderId: 'order_test', cacheId: 'cache_test' },
      { kind: 'membership_rank_at_least', sectRef: 'sect_shaolin', level: 3 },
      { kind: 'economy_budget_remaining', bucket: 'quest', minWen: 500 },
    ] as const;
    for (const estate of conditions) expect(compileCondition({ estate })(facts)).toBe(true);
  });

  it('converts exactly representable decimal duty ratios to basis points', () => {
    const matches = (ratio: number, dutyRatioBp: number) => compileCondition({ estate: {
      kind: 'job_duty_ratio_at_least', contractId: 'contract_test', ratio,
    } })({ estate: { jobs: [{ contractId: 'contract_test', jobRef: 'job_test',
      businessRef: 'biz_test', active: true, dutyRatioBp }] } });
    for (const [ratio, requiredBp] of [[0.0003, 3], [0.75, 7_500], [1, 10_000]] as const) {
      expect(matches(ratio, requiredBp)).toBe(true);
      expect(matches(ratio, requiredBp - 1)).toBe(false);
    }
    for (const ratio of [0.00031, 0.75001, -0.0001, 1.0001]) {
      expect(() => matches(ratio, 10_000)).toThrow('CONDITION_ratio');
    }
  });

  it('uses the clock-derived period when StoryRuntime evaluates a gate', async () => {
    const { StoryRuntime } = await import('./runtime');
    const source = { document: 'test', anchors: ['test'] } as const;
    const line = { schemaVersion: 'story.v1', chapterId: 'ch01_tianlong', lineId: 'main',
      kind: 'main', titleKey: 'test.main', eraLayer: 'ch01', startNodeId: 'n_gate', sideHooks: [],
      nodes: [{ id: 'n_gate', type: 'condition', titleKey: 'test.gate', completeOn: 'immediate',
        payload: { expression: { time: { period: 'day', yearMin: 1093 } } }, sourceRef: 'test' },
      { id: 'n_end', type: 'end', titleKey: 'test.end', completeOn: 'immediate',
        payload: { endingTags: ['day'] }, sourceRef: 'test' }],
      edges: [{ id: 'e_end', from: 'n_gate', to: 'n_end', trigger: 'auto', priority: 0 }],
      source } as unknown as StoryLine;
    const runtime = new StoryRuntime([line], { nowTick: 7 * 600, epochYear: 1093 });
    expect(runtime.start().snapshot.endingTags).toEqual(['day']);
  });

  it('derives the condition year from advanced runtime ticks', async () => {
    const { StoryRuntime } = await import('./runtime');
    const source = { document: 'test', anchors: ['test'] } as const;
    const line = { schemaVersion: 'story.v1', chapterId: 'ch01_tianlong', lineId: 'main',
      kind: 'main', titleKey: 'test.main', eraLayer: 'ch01', startNodeId: 'n_gate', sideHooks: [],
      nodes: [{ id: 'n_gate', type: 'condition', titleKey: 'test.gate', completeOn: 'immediate',
        payload: { expression: { time: { yearMin: 1094 } } }, sourceRef: 'test' },
      { id: 'n_end', type: 'end', titleKey: 'test.end', completeOn: 'immediate',
        payload: { endingTags: ['next_year'] }, sourceRef: 'test' }],
      edges: [{ id: 'e_end', from: 'n_gate', to: 'n_end', trigger: 'auto', priority: 0 }],
      source } as unknown as StoryLine;
    const runtime = new StoryRuntime([line], { nowTick: TICKS_PER_YEAR - 1, epochYear: 1093 });
    expect(runtime.start().snapshot.endingTags).toEqual([]);
    expect(runtime.advanceTo(TICKS_PER_YEAR).snapshot.endingTags).toEqual(['next_year']);
  });
});
