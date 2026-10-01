export interface StorageRecord {
  readonly key: string;
  readonly value: Uint8Array;
}

export interface StoragePort {
  get(key: string): Promise<StorageRecord | null>;
  put(record: StorageRecord): Promise<void>;
  delete(key: string): Promise<void>;
}
