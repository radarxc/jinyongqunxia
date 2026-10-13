import type { GameContent } from './content';

/** Only full-extent painted maps share the world's grid projection. */
export function worldMapTexture(content: Pick<GameContent, 'assets'>, era: string): string {
  return content.assets?.[`map_world_jianghu__${era}`]?.map
    ?? content.assets?.['map_world_jianghu__base01']?.map
    ?? '/assets/default/map/world/map_world_jianghu__base01.webp';
}
