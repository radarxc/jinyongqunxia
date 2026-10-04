declare module 'virtual:tianshu-offline-build' {
  import type { OfflineFile } from '@tianshu/platform/offline';
  const metadata: {
    assets: readonly OfflineFile[];
    chapters: Readonly<Record<string, { releaseHash: string;
      files: readonly OfflineFile[] }>>;
  };
  export default metadata;
}
