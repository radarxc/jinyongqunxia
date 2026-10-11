import { townPlanNotImplemented } from '../types';

export interface BuildKitSource {
  readonly schemaVersion: 'buildkit.v1';
  readonly id: string;
  readonly archetypes: Readonly<Record<string, unknown>>;
  readonly landmarks?: Readonly<Record<string, unknown>>;
}

export function parseBuildKitSource(_source: unknown): BuildKitSource {
  return townPlanNotImplemented('parseBuildKitSource');
}
