export interface WorldTickCommand {
  readonly t: 'world/tick';
}

export type Command = WorldTickCommand;
