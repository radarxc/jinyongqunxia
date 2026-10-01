import { defineStore } from 'pinia';
import { markRaw, shallowRef } from 'vue';

export interface UiProjection {
  readonly title: string;
  readonly coreVersion: string;
  readonly worldTick: number;
  readonly status: string;
}

const initialProjection: UiProjection = {
  title: '天书录',
  coreVersion: '未连接',
  worldTick: 0,
  status: '静候入梦',
};

export const useUiStore = defineStore('ui', () => {
  const projection = shallowRef<UiProjection>(markRaw(initialProjection));
  function replaceProjection(next: UiProjection): void {
    projection.value = markRaw(next);
  }
  return { projection, replaceProjection };
});
