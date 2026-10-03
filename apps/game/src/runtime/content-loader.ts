import { itemContentChapter, loadGameContent, loadRegionMaps } from './item-content';

/** Single-export adapter keeps content schemas independent from optional Ink handlers. */
export function createContentLoader() {
  return { itemContentChapter, loadGameContent, loadRegionMaps };
}
