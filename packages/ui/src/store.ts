import { defineStore } from 'pinia';
import { markRaw, shallowRef } from 'vue';
import type { UiProjection } from './projections';
export type { UiProjection } from './projections';

const initialProjection: UiProjection = {
  title: '天书录',
  coreVersion: '未连接',
  worldTick: 0,
  status: '静候入梦',
  hud: { name: '无名侠客', hp: { current: 0, maximum: 0 }, mp: { current: 0, maximum: 0 },
    action: null, date: '江湖未启', location: '入梦处', money: 0, preview: true },
  characters: [], inventory: [], equipment: [], quests: [],
};

export const useUiStore = defineStore('ui', () => {
  const projection = shallowRef<UiProjection>(markRaw(initialProjection));
  function replaceProjection(next: UiProjection): void {
    projection.value = markRaw(next);
  }
  function applyProjection(changes: Partial<UiProjection>): void {
    if (Object.keys(changes).length) projection.value = markRaw({ ...projection.value, ...changes });
  }
  return { projection, replaceProjection, applyProjection };
});
