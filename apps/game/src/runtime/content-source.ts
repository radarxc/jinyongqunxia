import type { ContentSource } from '@tianshu/data';
import { FetchContentSource } from './item-content';

/** Single-export adapter keeps the Worker import from materialising item-content's namespace. */
export function createFetchContentSource(): ContentSource {
  return new FetchContentSource();
}
