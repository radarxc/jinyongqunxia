export interface WorldTickedEvent {
  readonly t: 'world/ticked';
  readonly seq: number;
  readonly stateVersion: number;
  readonly worldTick: number;
}

export type DomainEvent = WorldTickedEvent;
