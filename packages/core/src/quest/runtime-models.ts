import type { JsonValue } from '@tianshu/shared';
import type { ResolvedStoryWindow, StoryLineState } from '../state';
import type { DialogueSession, InkDialogueBridge } from '../dialogue';
import type { NpcWorldState } from '../npc';
import type { ConditionFacts } from './condition';

export type QuestPortEffect =
  | { readonly type: 'activate'; readonly questId: string; readonly receiptId: string }
  | { readonly type: 'executeEvent'; readonly eventKey: string;
    readonly actions: readonly Readonly<Record<string, JsonValue>>[]; readonly receiptId: string };
export interface QuestPort {
  /** Atomically commits every effect or throws without publishing any of them. */
  commit(effects: readonly QuestPortEffect[]): void;
}
export interface StoryRuntimePorts {
  readonly quest: QuestPort; readonly dialogue?: InkDialogueBridge;
  readonly inkSeed?: number;
}
export type StoryWait =
  | { readonly kind: 'dialogue'; readonly lineId: string; readonly nodeId: string; readonly session: DialogueSession }
  | { readonly kind: 'quest'; readonly lineId: string; readonly nodeId: string; readonly questId: string }
  | { readonly kind: 'choice'; readonly lineId: string; readonly nodeId: string; readonly options: readonly string[] };
export interface StoryEvent {
  readonly t: `story/${string}`; readonly chapterId: string; readonly lineId: string;
  readonly nodeId: string; readonly causeId: string; readonly receiptId: string;
  readonly payload?: JsonValue;
}
export interface StoryRuntimeSnapshot {
  readonly chapterId: string; readonly nowTick: number; readonly lines: readonly StoryLineState[];
  readonly npc: NpcWorldState; readonly facts: ConditionFacts; readonly wait: StoryWait | null;
  readonly suspendedWaits: readonly StoryWait[];
  readonly lineWindows: Readonly<Record<string, ResolvedStoryWindow>>;
  readonly endingTags: readonly string[]; readonly eventTicks: Readonly<Record<string, number>>;
}
export interface StoryStepResult {
  readonly snapshot: StoryRuntimeSnapshot; readonly events: readonly StoryEvent[];
}

