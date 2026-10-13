export interface AreaMapControlPorts {
  readonly isOpen: () => boolean;
  readonly setOpen: (open: boolean) => void;
  readonly acquireContext: (close: () => void) => () => void;
  readonly holdWorldTicks: () => () => void;
}

export interface AreaMapController {
  set(open: boolean): void;
  toggle(): void;
  dispose(): void;
}

/** Shared lifecycle for M, Escape, the minimap control, and component unmount. */
export function createAreaMapController(ports: AreaMapControlPorts): AreaMapController {
  let releaseContext: (() => void) | undefined;
  let releaseTicks: (() => void) | undefined;
  const release = (): void => {
    releaseContext?.(); releaseContext = undefined;
    releaseTicks?.(); releaseTicks = undefined;
  };
  const set = (open: boolean): void => {
    if (ports.isOpen() === open) return;
    if (!open) { ports.setOpen(false); release(); return; }
    ports.setOpen(true);
    releaseTicks = ports.holdWorldTicks();
    releaseContext = ports.acquireContext(() => set(false));
  };
  return {
    set,
    toggle: () => set(!ports.isOpen()),
    dispose: () => {
      if (ports.isOpen()) ports.setOpen(false);
      release();
    },
  };
}
