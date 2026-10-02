import type { EquipmentSlot } from '@tianshu/core';

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
