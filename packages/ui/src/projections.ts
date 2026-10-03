import type { EquipmentSlot, WorldMapStaticProjection } from '@tianshu/core';

export interface ResourceView {
  readonly current: number;
  readonly maximum: number;
}
export interface HudView {
  readonly name: string;
  readonly hp: ResourceView;
  readonly mp: ResourceView;
  readonly action: ResourceView | null;
  readonly date: string;
  readonly location: string;
  readonly money: number;
  readonly preview: boolean;
}
export interface StatView {
  readonly key: string;
  readonly label: string;
  readonly value: number;
}
export interface SkillView {
  readonly id: string;
  readonly name: string;
  readonly layer: number;
  readonly grade: number;
  readonly description: string;
}
export interface AcupointView {
  readonly id: string;
  readonly name: string;
  readonly opened: boolean;
  readonly grade: number | null;
  readonly strength: number | null;
  readonly flux: number | null;
}
export interface MeridianView {
  readonly id: string;
  readonly name: string;
  readonly completed: boolean;
  readonly grade: number | null;
  readonly strength: number | null;
  readonly flux: number | null;
  readonly points: readonly AcupointView[];
}
export interface CharacterDetailView {
  readonly stats: readonly StatView[];
  readonly skills: readonly SkillView[];
  readonly meridians: readonly MeridianView[];
  readonly opened: number;
  readonly completed: number;
}
export interface CharacterView {
  readonly key: string;
  readonly name: string;
  readonly faction: string;
  readonly relation: 'self' | 'unseen' | 'met' | 'befriended';
  readonly affinity: number | null;
  readonly biography: string;
  readonly portrait: string | null;
  readonly detail: CharacterDetailView | null;
}
export const ITEM_CATEGORIES = [
  'medicine',
  'food',
  'manuals',
  'weapons',
  'clothing',
  'armor',
  'innerarmor',
  'accessories',
  'shoes',
  'belts',
  'hidden-weapons',
  'quest',
] as const;
export type ItemCategory = (typeof ITEM_CATEGORIES)[number] | 'other';
export interface ItemView {
  readonly id: string;
  readonly name: string;
  readonly category: ItemCategory;
  readonly count: number;
  readonly grade: number | null;
  readonly ageYears: number | null;
  readonly icon: string | null;
  readonly description: string;
  readonly source: string;
  readonly effects: readonly string[];
  readonly slot: EquipmentSlot | null;
  readonly canUse: boolean;
  readonly useReason: string;
}
export interface EquipmentView {
  readonly slot: EquipmentSlot;
  readonly item: ItemView | null;
}
export interface QuestView {
  readonly id: string;
  readonly name: string;
  readonly status: string;
}
export interface DialogueChoiceView {
  readonly choiceIndex: number; readonly textKey: string; readonly unavailableReason: string | null;
}
export interface DialogueView {
  readonly storyId: string; readonly storyHash: string; readonly entryKey: string;
  readonly speakerId: string; readonly textKey: string | null;
  readonly choices: readonly DialogueChoiceView[];
  readonly history: readonly { readonly speakerId: string; readonly textKey: string }[];
}
export interface DialoguePanelChoiceView {
  readonly id: string;
  readonly label: string;
  readonly disabledReason?: string;
}
export interface DialoguePanelView {
  readonly speaker: string;
  readonly text: string;
  readonly choices: readonly DialoguePanelChoiceView[];
  readonly history: readonly { readonly speaker: string; readonly text: string }[];
  readonly canContinue: boolean;
}
export interface QuestLogEntryView {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly status: string;
  readonly summary: string;
  readonly tracked: boolean;
}
export interface QuestTrackerView {
  readonly questId: string;
  readonly name: string;
  readonly objective: string;
  readonly current?: number;
  readonly target?: number;
}
export interface FlowSettingsView {
  readonly textScale: 100 | 125 | 150;
  readonly reducedMotion: boolean;
  readonly subtitles: boolean;
  readonly volume: Readonly<Record<'master' | 'music' | 'effects' | 'voice', number>>;
  readonly quality: 'auto' | 'low' | 'mid' | 'high' | 'ultra';
  readonly difficulty: 'diff_jianghu' | 'diff_xiake' | 'diff_zongshi';
}
export interface UiProjection {
  readonly title: string;
  readonly coreVersion: string;
  readonly worldTick: number;
  readonly status: string;
  readonly hud: HudView;
  readonly characters: readonly CharacterView[];
  readonly inventory: readonly ItemView[];
  readonly equipment: readonly EquipmentView[];
  readonly quests: readonly QuestView[];
  readonly dialogue?: DialogueView | null;
  readonly worldmapStatic?: WorldMapStaticProjection | null;
}
export interface SaveSlotView {
  readonly id: string;
  readonly label: string;
  readonly kind: 'manual' | 'quick' | 'auto' | 'checkpoint';
  readonly occupied: boolean;
  readonly savedAt: string;
  readonly summary: string;
  readonly writable: boolean;
  readonly readable: boolean;
  readonly generations: readonly {
    readonly generation: number;
    readonly savedAt: string;
    readonly current: boolean;
  }[];
}
export type MenuPage =
  'journey' | 'characters' | 'inventory' | 'martial' | 'quests' | 'saves' | 'settings';
