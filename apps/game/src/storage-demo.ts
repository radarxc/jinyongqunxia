import {
  createIndexedDbStorage,
  sha256Hex,
  StorageError,
  type TianshuStorage,
} from '@tianshu/platform';

const DEMO_SNAPSHOT = new TextEncoder().encode('{"meta":{"worldTick":1},"version":1}');

export async function mountStorageDemo(container: HTMLElement): Promise<() => Promise<void>> {
  const panel = document.createElement('section');
  panel.id = 'storage-demo';
  panel.setAttribute('aria-label', 'IndexedDB 存储示例');

  const title = document.createElement('strong');
  title.textContent = '本地存档示例';
  const saveButton = document.createElement('button');
  saveButton.type = 'button';
  saveButton.textContent = '存一个假快照';
  const loadButton = document.createElement('button');
  loadButton.type = 'button';
  loadButton.textContent = '读回快照';
  const status = document.createElement('output');
  status.setAttribute('aria-live', 'polite');
  status.textContent = '正在打开 IndexedDB…';
  panel.append(title, saveButton, loadButton, status);
  container.append(panel);

  let storage: TianshuStorage;
  try {
    storage = await createIndexedDbStorage();
    status.textContent = 'IndexedDB 已就绪';
  } catch (error) {
    status.textContent = describeError(error);
    saveButton.disabled = true;
    loadButton.disabled = true;
    return async () => undefined;
  }

  saveButton.addEventListener('click', () => {
    void saveDemo(storage, status);
  });
  loadButton.addEventListener('click', () => {
    void loadDemo(storage, status);
  });

  return async () => storage.close();
}

async function saveDemo(storage: TianshuStorage, status: HTMLOutputElement): Promise<void> {
  try {
    const hash = await sha256Hex(DEMO_SNAPSHOT);
    const saved = await storage.saves.save('save_quick', DEMO_SNAPSHOT, {
      worldId: 'ch00_yuenv',
      gameTime: 1,
      version: 'storage-demo-v1',
      schemaVersion: 2,
      hash,
      summary: { locationName: '示例页', worldTick: 1 },
    });
    status.textContent = `已存 save_quick · ${saved.byteLength} B · 第 ${saved.generation} 代`;
  } catch (error) {
    status.textContent = describeError(error);
  }
}

async function loadDemo(storage: TianshuStorage, status: HTMLOutputElement): Promise<void> {
  try {
    const saved = await storage.saves.load('save_quick');
    status.textContent = saved
      ? `已读 ${new TextDecoder().decode(saved.snapshot)} · hash 校验通过`
      : 'save_quick 尚无存档';
  } catch (error) {
    status.textContent = describeError(error);
  }
}

function describeError(error: unknown): string {
  return error instanceof StorageError
    ? `存储失败 [${error.code}]：${error.message}`
    : `存储失败：${String(error)}`;
}
