export interface ProjectionUpdate<View, Event> {
  readonly accepted: boolean; readonly changes: Partial<View>;
  readonly events: readonly Event[]; readonly error?: string;
}

/** Transport only: View never contains the authoritative state tree. */
export interface ProjectionRemote<Command, View, Snapshot, Event> {
  dispatch(command: Command): ProjectionUpdate<View, Event> | Promise<ProjectionUpdate<View, Event>>;
  query(): View | Promise<View>;
  snapshot(): Snapshot | Promise<Snapshot>;
  validate(snapshot: Snapshot): void | Promise<void>;
  restore(snapshot: Snapshot): ProjectionUpdate<View, Event> | Promise<ProjectionUpdate<View, Event>>;
}
export interface ProjectionHost<Command, View, Snapshot, Event> {
  readonly mode: 'worker' | 'main-thread';
  dispatch(command: Command): Promise<ProjectionUpdate<View, Event>>;
  query(): Promise<View>;
  snapshot(): Promise<Snapshot>;
  validate(snapshot: Snapshot): Promise<void>;
  restore(snapshot: Snapshot): Promise<ProjectionUpdate<View, Event>>;
  subscribe(listener: (update: ProjectionUpdate<View, Event>) => void): () => void;
  dispose(): void;
}
