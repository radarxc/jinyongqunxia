export interface AudioPort {
  unlock(): Promise<void>;
  play(cue: string): void;
  stop(cue: string): void;
}
