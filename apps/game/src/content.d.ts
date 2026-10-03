declare module 'virtual:tianshu-content' {
  import type { StaticGameContent } from './runtime/content';
  const content: StaticGameContent;
  export default content;
}
declare module 'virtual:tianshu-towns' {
  import type { TownRuntimeDefinition } from '@tianshu/data/schemas';
  export const townIds: readonly string[];
  export function loadTown(sceneId: string): Promise<TownRuntimeDefinition | null>;
}
