export type ConditionScalar = string | number | boolean | null;
export type QuestStatus =
  | 'locked' | 'available' | 'active' | 'suspended' | 'completed' | 'failed' | 'expired';
export interface QuestConditionFact { readonly state: QuestStatus; readonly stage?: string; }
export interface NpcConditionFact {
  readonly state: string; readonly affinity: number; readonly bond: number; readonly resentment: number;
}
export interface CompanionConditionFact {
  readonly station: string | null; readonly everRecruited: boolean;
}
export interface SectConditionFact {
  readonly status: string; readonly rank: number | `L${1 | 2 | 3 | 4 | 5}`;
  readonly contribution: number;
}
export type TimePeriod = 'night' | 'dawn' | 'day' | 'dusk';
export interface TimeConditionFact {
  readonly year: number; readonly period: TimePeriod;
}
export interface LocationConditionFact {
  readonly regionId?: string; readonly cityId?: string | null;
  readonly placeKey?: string | null; readonly eraLayer: string;
}
export interface EventConditionFact {
  readonly name: string; readonly fields?: Readonly<Record<string, ConditionScalar>>;
}
export interface LegacySourceConditionFact {
  readonly status: string; readonly fragmentCount: number;
  readonly hasKeystone: boolean; readonly localMisses: number;
}
export interface LegacyCacheConditionFact { readonly state: string; readonly progress: number; }
export interface EstateConditionFacts {
  readonly resources?: readonly { readonly resourceRef: string; readonly quantity: number;
    readonly scope: 'bag' | 'estate' | 'point'; readonly pointRef?: string }[];
  readonly resourcePoints?: Readonly<Record<string, { readonly ownership: string; readonly level: number }>>;
  readonly servants?: readonly { readonly servantRef: string; readonly loyalty: number;
    readonly specialties: Readonly<Record<string, number>>; readonly available: boolean }[];
  readonly businessRelations?: Readonly<Record<string, number>>;
  readonly jobs?: readonly { readonly contractId: string; readonly jobRef: string;
    readonly businessRef: string; readonly active: boolean; readonly dutyRatioBp: number }[];
  readonly keqingSlotFree?: boolean;
  readonly freeSchedule?: readonly { readonly day: number; readonly blocks: readonly string[] }[];
  readonly validSacrificeQuotes?: Readonly<Record<string, string>>;
  readonly activeExcavationOrders?: Readonly<Record<string, string>>;
  readonly membershipRanks?: Readonly<Record<string, number>>;
  readonly budgetRemaining?: Readonly<Record<string, number>>;
}
export interface ConditionFacts {
  readonly flags?: Readonly<Record<string, boolean>>;
  readonly quests?: Readonly<Record<string, QuestStatus | QuestConditionFact>>;
  readonly inventory?: Readonly<Record<string, number>>;
  readonly stats?: Readonly<Record<string, number>>;
  readonly arts?: Readonly<Record<string, number>>;
  readonly sectContributions?: Readonly<Record<string, number>>;
  readonly counters?: Readonly<Record<string, number>>;
  readonly eventFields?: Readonly<Record<string, ConditionScalar>>;
  readonly npcStates?: Readonly<Record<string, string>>;
  readonly npcRelationships?: Readonly<Record<string, Omit<NpcConditionFact, 'state'>>>;
  readonly sects?: Readonly<Record<string, SectConditionFact>>;
  readonly companions?: Readonly<Record<string, CompanionConditionFact>>;
  readonly time?: TimeConditionFact; readonly location?: LocationConditionFact;
  readonly estate?: EstateConditionFacts; readonly event?: EventConditionFact;
  readonly legacySources?: Readonly<Record<string, LegacySourceConditionFact>>;
  readonly legacyCaches?: Readonly<Record<string, LegacyCacheConditionFact>>;
  readonly storyNodes?: Readonly<Record<string, 'completed' | 'expired'>>;
}
export type ConditionProgram = (facts: ConditionFacts) => boolean;
