import { pwaController, type PwaControllerSnapshot, type UpdateSafety } from '@tianshu/platform/pwa';

export type { PwaControllerSnapshot } from '@tianshu/platform/pwa';
export type PwaListener = (snapshot: PwaControllerSnapshot) => void;

export function subscribePwa(listener: PwaListener): () => void {
  return pwaController.subscribe(listener);
}
export function activatePwaUpdate(safety?: UpdateSafety): Promise<boolean> {
  return pwaController.activate(safety);
}
export function remindPwaUpdateLater(): void { pwaController.remindLater(); }
export function forcePwaUpdate(): Promise<void> { return pwaController.forceUpdate(); }
