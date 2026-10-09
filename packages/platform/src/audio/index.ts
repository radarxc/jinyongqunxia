export interface AudioPort {
  unlock(): Promise<void>;
  play(cue: string): void;
  stop(cue: string): void;
}

export * from './manifest';
export * from './audio-manager';
