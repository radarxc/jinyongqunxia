import type { DownloadPhase, DownloadProgress } from './types';

export class VerifiedProgress {
  private verifiedBytes: number;
  private completedFiles: number;
  private sampledAt: number;
  private sampledBytes: number;
  private speed: number | null = null;
  private readonly startedAt: number;

  constructor(
    private readonly totalBytes: number,
    private readonly totalFiles: number,
    initialBytes: number,
    initialFiles: number,
    private readonly now: () => number,
    private readonly emit?: (progress: DownloadProgress) => void,
  ) { this.verifiedBytes = initialBytes; this.completedFiles = initialFiles;
    this.sampledAt = now(); this.startedAt = this.sampledAt; this.sampledBytes = initialBytes; }

  report(phase: DownloadPhase, activeUrl?: string): void {
    this.emit?.({ phase, verifiedBytes: this.verifiedBytes, totalBytes: this.totalBytes,
      completedFiles: this.completedFiles, totalFiles: this.totalFiles,
      bytesPerSecond: this.now() - this.startedAt >= 3000 ? this.speed : null,
      etaSeconds: this.now() - this.startedAt >= 3000 && this.speed && this.speed > 0
        ? Math.ceil((this.totalBytes - this.verifiedBytes) / this.speed) : null,
      ...(activeUrl === undefined ? {} : { activeUrl }) });
  }

  verified(bytes: number, activeUrl?: string): void {
    const time = this.now(); const elapsed = Math.max(0, time - this.sampledAt);
    this.verifiedBytes += bytes; this.completedFiles += 1;
    if (elapsed > 0) {
      const instant = (this.verifiedBytes - this.sampledBytes) * 1_000 / elapsed;
      const alpha = 1 - Math.exp(-elapsed / 10_000);
      this.speed = this.speed === null ? instant : this.speed + alpha * (instant - this.speed);
      this.sampledAt = time; this.sampledBytes = this.verifiedBytes;
    }
    this.report('downloading', activeUrl);
  }

  snapshot(): { verifiedBytes: number; completedFiles: number } {
    return { verifiedBytes: this.verifiedBytes, completedFiles: this.completedFiles };
  }
}
