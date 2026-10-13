export const BODY_TEMPLATE_HEIGHT_M = {
  tpl_f_small: 1.58,
  tpl_f_medium: 1.66,
  tpl_f_tall: 1.72,
  tpl_m_lean: 1.76,
  tpl_m_medium: 1.81,
  tpl_m_bulk: 1.86,
} as const;

export const DEFAULT_PLAYER_HEIGHT_M = { male: 1.81, female: 1.66 } as const;
export const DEFAULT_NPC_HEIGHT_M = { male: 1.70, female: 1.62 } as const;

export type BodyTemplateId = keyof typeof BODY_TEMPLATE_HEIGHT_M;

export function heightForTemplate(id: string): number {
  if (!Object.prototype.hasOwnProperty.call(BODY_TEMPLATE_HEIGHT_M, id))
    throw new RangeError(`UNKNOWN_BODY_TEMPLATE:${id}`);
  return BODY_TEMPLATE_HEIGHT_M[id as BodyTemplateId];
}
