import type { PersistenceStatus, StoragePersistence } from './types';

export class StoragePersistenceController implements StoragePersistence {
  private requested = false;
  private result: PersistenceStatus | undefined;

  constructor(private readonly manager: Pick<StorageManager, 'persist' | 'persisted'> | null) {}

  async requestOnFirstSave(): Promise<PersistenceStatus> {
    if (this.requested) return this.result ?? 'denied';
    this.requested = true;
    if (!this.manager?.persist || !this.manager.persisted) {
      this.result = 'unsupported';
      return this.result;
    }
    try {
      this.result =
        (await this.manager.persisted()) || (await this.manager.persist()) ? 'granted' : 'denied';
    } catch {
      this.result = 'denied';
    }
    return this.result;
  }

  async status(): Promise<PersistenceStatus> {
    if (this.result) return this.result;
    if (!this.manager?.persisted) return 'unsupported';
    try {
      return (await this.manager.persisted()) ? 'granted' : 'not-requested';
    } catch {
      return 'unsupported';
    }
  }
}
