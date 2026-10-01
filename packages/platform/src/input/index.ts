export interface InputPoint {
  readonly x: number;
  readonly y: number;
}
export interface InputPort {
  subscribe(listener: (point: InputPoint) => void): () => void;
}
