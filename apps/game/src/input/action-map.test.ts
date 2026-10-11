import { describe, expect, it, vi } from 'vitest';
import type { KeyboardEdge, KeyboardEdgeListener, KeyboardState } from '@tianshu/platform/input';
import { regionKeyboardTarget } from '../region/presentation';
import {
  createActionMap,
  screenVectorToHexDir,
  type ActionHandlers,
  type KeyboardDomTarget,
} from './action-map';

function edge(code: string, overrides: Partial<KeyboardEdge> = {}): KeyboardEdge {
  return {
    code,
    key: '',
    down: true,
    repeat: false,
    shift: false,
    ctrl: false,
    alt: false,
    meta: false,
    composing: false,
    editableTarget: false,
    ...overrides,
  };
}

describe('ActionMap key table', () => {
  it.each([
    ['Equal', 'zoomIn'],
    ['NumpadAdd', 'zoomIn'],
    ['Minus', 'zoomOut'],
    ['NumpadSubtract', 'zoomOut'],
    ['Digit0', 'zoomReset'],
    ['Numpad0', 'zoomReset'],
    ['KeyQ', 'rotateLeft'],
    ['KeyE', 'rotateRight'],
    ['KeyF', 'interact'],
    ['Space', 'interact'],
    ['Enter', 'interact'],
    ['KeyM', 'toggleAreaMap'],
  ] as const)('maps %s to %s in explore', (code, action) => {
    const map = createActionMap();
    const handler = vi.fn();
    map.pushContext('explore', { [action]: handler } as ActionHandlers);
    expect(map.handle(edge(code))).toBe(true);
    expect(handler).toHaveBeenCalledOnce();
  });

  it.each([
    ['KeyC', 'characters'],
    ['KeyB', 'inventory'],
    ['KeyK', 'martial'],
    ['KeyJ', 'quests'],
    ['KeyM', 'journey'],
  ] as const)('maps global %s to %s', (code, destination) => {
    const map = createActionMap();
    const navigate = vi.fn();
    map.pushContext('global', { navigate });
    expect(map.handle(edge(code))).toBe(true);
    expect(navigate).toHaveBeenCalledWith(destination);
  });

  it('maps Escape and Backquote globally', () => {
    const map = createActionMap();
    const back = vi.fn();
    const toggleDevPanel = vi.fn();
    map.pushContext('global', { back, toggleDevPanel });
    expect(map.handle(edge('Escape'))).toBe(true);
    expect(map.handle(edge('Backquote'))).toBe(true);
    expect(back).toHaveBeenCalledOnce();
    expect(toggleDevPanel).toHaveBeenCalledOnce();
  });

  it.each([
    ['KeyW', 0, -1],
    ['ArrowUp', 0, -1],
    ['KeyA', -1, 0],
    ['ArrowLeft', -1, 0],
    ['KeyS', 0, 1],
    ['ArrowDown', 0, 1],
    ['KeyD', 1, 0],
    ['ArrowRight', 1, 0],
  ] as const)('maps held %s to screen vector (%i, %i)', (code, vx, vy) => {
    const map = createActionMap();
    const move = vi.fn();
    map.pushContext('explore', { move });
    expect(map.handle(edge(code), new Set([code]))).toBe(true);
    expect(move).toHaveBeenCalledWith({ vx, vy });
  });

  it('emits W once while an equivalent ArrowUp is pressed and released', () => {
    const map = createActionMap();
    const move = vi.fn();
    map.pushContext('explore', { move });
    expect(map.handle(edge('KeyW'))).toBe(true);
    expect(map.handle(edge('ArrowUp'))).toBe(true);
    expect(map.handle(edge('KeyW', { down: false }))).toBe(true);
    expect(move).toHaveBeenCalledTimes(1);
    expect(move).toHaveBeenLastCalledWith({ vx: 0, vy: -1 });
  });

  it('emits zero when the last movement key is released with a modifier', () => {
    const map = createActionMap();
    const move = vi.fn();
    map.pushContext('explore', { move });
    map.handle(edge('KeyW'));
    expect(map.handle(edge('KeyW', { down: false, ctrl: true }))).toBe(true);
    expect(move).toHaveBeenLastCalledWith({ vx: 0, vy: 0 });
    expect(move).toHaveBeenCalledTimes(2);
  });

  it('can force re-emit the held vector after camera rotation', () => {
    const map = createActionMap();
    const move = vi.fn();
    map.pushContext('explore', { move });
    map.handle(edge('KeyW'));
    expect(map.reemitMove()).toBe(true);
    expect(move).toHaveBeenCalledTimes(2);
    expect(move).toHaveBeenLastCalledWith({ vx: 0, vy: -1 });
  });

  it('never lets keys pressed in an editable target enter the move vector (real downCodes)', () => {
    const map = createActionMap();
    const move = vi.fn();
    map.pushContext('explore', { move });
    const typing = { editableTarget: true };
    expect(map.handle(edge('KeyW', typing), new Set(['KeyW']))).toBe(false);
    expect(map.handle(edge('KeyD', typing), new Set(['KeyW', 'KeyD']))).toBe(false);
    expect(map.handle(edge('KeyW', { ...typing, down: false }), new Set(['KeyD']))).toBe(false);
    expect(map.handle(edge('KeyD', { ...typing, down: false }), new Set())).toBe(false);
    expect(move).not.toHaveBeenCalled();
  });

  it('stops an accepted key even when it is released on an editable target', () => {
    const map = createActionMap();
    const move = vi.fn();
    map.pushContext('explore', { move });
    map.handle(edge('KeyW'), new Set(['KeyW']));
    expect(map.handle(edge('KeyW', { down: false, editableTarget: true }), new Set())).toBe(true);
    expect(move.mock.calls).toEqual([[{ vx: 0, vy: -1 }], [{ vx: 0, vy: 0 }]]);
  });

  it('keeps keys pressed while explore was covered out of the vector after it returns', () => {
    const map = createActionMap();
    const move = vi.fn();
    map.pushContext('explore', { move });
    const pop = map.pushContext('dialogue', { back: vi.fn() });
    expect(map.handle(edge('KeyD'), new Set(['KeyD']))).toBe(false);
    pop();
    expect(map.handle(edge('KeyW'), new Set(['KeyD', 'KeyW']))).toBe(true);
    expect(move.mock.calls).toEqual([[{ vx: 0, vy: -1 }]]);
  });

  it('stops the walking explore context when a dialogue covers it', () => {
    const map = createActionMap();
    const move = vi.fn();
    map.pushContext('explore', { move });
    map.handle(edge('KeyW'), new Set(['KeyW']));
    const pop = map.pushContext('dialogue', { back: vi.fn() });
    expect(move).toHaveBeenLastCalledWith({ vx: 0, vy: 0 });
    expect(map.handle(edge('KeyW', { down: false }), new Set())).toBe(false);
    pop();
    expect(map.handle(edge('KeyW'), new Set(['KeyW']))).toBe(true);
    expect(move.mock.calls).toEqual([[{ vx: 0, vy: -1 }], [{ vx: 0, vy: 0 }], [{ vx: 0, vy: -1 }]]);
  });

  it('gives a remounted explore context its first W instead of treating it as a repeat', () => {
    const map = createActionMap();
    const oldMove = vi.fn();
    const newMove = vi.fn();
    const popOld = map.pushContext('explore', { move: oldMove });
    map.handle(edge('KeyW'), new Set(['KeyW']));
    popOld();
    map.handle(edge('KeyW', { down: false }), new Set());
    map.pushContext('explore', { move: newMove });
    expect(map.handle(edge('KeyW'), new Set(['KeyW']))).toBe(true);
    expect(oldMove.mock.calls).toEqual([[{ vx: 0, vy: -1 }], [{ vx: 0, vy: 0 }]]);
    expect(newMove.mock.calls).toEqual([[{ vx: 0, vy: -1 }]]);
  });

  function dialogHarness(map: ReturnType<typeof createActionMap>) {
    let subscriber: KeyboardEdgeListener | undefined;
    let down = new Set<string>();
    const source: KeyboardState = {
      isDown: (code) => down.has(code),
      downCodes: () => down,
      dispose: vi.fn(),
      subscribe(listener) {
        subscriber = listener;
        return () => {
          subscriber = undefined;
        };
      },
    };
    const capture: Array<(event: KeyboardEvent) => void> = [];
    const bubble: Array<(event: KeyboardEvent) => void> = [];
    const target: KeyboardDomTarget = {
      addEventListener(type, listener, useCapture) {
        if (type === 'keydown' || type === 'keyup') (useCapture ? capture : bubble).push(listener);
      },
      removeEventListener() {},
    };
    map.connect(source, target);
    const dialogElement = { closest: (query: string) => (query === '[role=dialog]' ? {} : null) };
    return (
      code: string,
      key: string,
      isDown: boolean,
      held: readonly string[],
      overrides: Partial<KeyboardEdge> = {},
    ) => {
      const preventDefault = vi.fn();
      const event = {
        code,
        key,
        target: dialogElement,
        defaultPrevented: false,
        preventDefault,
      } as unknown as KeyboardEvent;
      down = new Set(held);
      capture[isDown ? 0 : 1]!(event);
      subscriber!(edge(code, { key, down: isDown, ...overrides }));
      if (isDown) bubble[0]!(event);
      return preventDefault;
    };
  }

  it('routes Escape inside a [role=dialog] to the dialogue context, never to global', () => {
    const map = createActionMap();
    const globalBack = vi.fn();
    const navigate = vi.fn();
    const dialogueBack = vi.fn();
    map.pushContext('global', { back: globalBack, navigate });
    map.pushContext('dialogue', { back: dialogueBack });
    const press = dialogHarness(map);
    expect(press('Escape', 'Escape', true, ['Escape'])).toHaveBeenCalledOnce();
    press('KeyC', 'c', true, ['KeyC']);
    expect(dialogueBack).toHaveBeenCalledOnce();
    expect(globalBack).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });

  it('ignores Escape typed into an editable field inside a [role=dialog]', () => {
    const map = createActionMap();
    const globalBack = vi.fn();
    const dialogueBack = vi.fn();
    const modalBack = vi.fn();
    map.pushContext('global', { back: globalBack });
    map.pushContext('dialogue', { back: dialogueBack });
    map.pushContext('modal', { back: modalBack });
    const press = dialogHarness(map);
    expect(
      press('Escape', 'Escape', true, ['Escape'], { editableTarget: true }),
    ).not.toHaveBeenCalled();
    expect(modalBack).not.toHaveBeenCalled();
    expect(dialogueBack).not.toHaveBeenCalled();
    expect(globalBack).not.toHaveBeenCalled();
  });

  it('keeps a [role=dialog] event away from global when no modal or dialogue context exists', () => {
    const map = createActionMap();
    const globalBack = vi.fn();
    map.pushContext('global', { back: globalBack });
    const press = dialogHarness(map);
    expect(press('Escape', 'Escape', true, ['Escape'])).not.toHaveBeenCalled();
    expect(globalBack).not.toHaveBeenCalled();
  });

  it('stops an accepted movement key released while focus is inside a [role=dialog]', () => {
    const map = createActionMap();
    const move = vi.fn();
    map.pushContext('explore', { move });
    map.handle(edge('KeyW'), new Set(['KeyW']));
    const press = dialogHarness(map);
    press('KeyW', 'w', false, []);
    expect(move.mock.calls).toEqual([[{ vx: 0, vy: -1 }], [{ vx: 0, vy: 0 }]]);
  });

  it('drops edges while disabled and never restores keys pressed during the disabled time', () => {
    const map = createActionMap();
    const move = vi.fn();
    let enabled = true;
    map.pushContext('explore', { move });
    let subscriber: KeyboardEdgeListener | undefined;
    let down = new Set<string>();
    const source: KeyboardState = {
      isDown: (code) => down.has(code),
      downCodes: () => down,
      dispose: vi.fn(),
      subscribe(listener) {
        subscriber = listener;
        return () => {
          subscriber = undefined;
        };
      },
    };
    map.connect(source, undefined, () => enabled);
    down = new Set(['KeyW']);
    subscriber!(edge('KeyW'));
    enabled = false;
    down = new Set(['KeyW', 'KeyD']);
    subscriber!(edge('KeyD'));
    enabled = true;
    down = new Set(['KeyW', 'KeyD', 'KeyS']);
    subscriber!(edge('KeyS'));
    expect(move.mock.calls).toEqual([[{ vx: 0, vy: -1 }], [{ vx: 0, vy: 0 }], [{ vx: 0, vy: 1 }]]);
  });

  it('sends the zero vector to a walking explore context when it is popped', () => {
    const map = createActionMap();
    const move = vi.fn();
    const pop = map.pushContext('explore', { move });
    map.handle(edge('KeyW'), new Set(['KeyW']));
    pop();
    expect(move.mock.calls).toEqual([[{ vx: 0, vy: -1 }], [{ vx: 0, vy: 0 }]]);
  });

  it('stops walking when its keyboard connection is released, without another key edge', () => {
    const map = createActionMap();
    const move = vi.fn();
    map.pushContext('explore', { move });
    let subscriber: KeyboardEdgeListener | undefined;
    const down = new Set(['KeyW']);
    const source: KeyboardState = {
      isDown: (code) => down.has(code),
      downCodes: () => down,
      dispose: vi.fn(),
      subscribe(listener) {
        subscriber = listener;
        return () => {
          subscriber = undefined;
        };
      },
    };
    const release = map.connect(source);
    subscriber!(edge('KeyW'));
    release();
    release();
    expect(move.mock.calls).toEqual([[{ vx: 0, vy: -1 }], [{ vx: 0, vy: 0 }]]);
  });

  it('cancelMovement stops at once on entering battle and held W does not resume after it', () => {
    const map = createActionMap();
    const move = vi.fn();
    let inBattle = false;
    map.pushContext('explore', { move });
    let subscriber: KeyboardEdgeListener | undefined;
    let down = new Set<string>();
    const source: KeyboardState = {
      isDown: (code) => down.has(code),
      downCodes: () => down,
      dispose: vi.fn(),
      subscribe(listener) {
        subscriber = listener;
        return () => {
          subscriber = undefined;
        };
      },
    };
    map.connect(source, undefined, () => !inBattle);
    down = new Set(['KeyW']);
    subscriber!(edge('KeyW'));
    inBattle = true;
    map.cancelMovement(); // App does this when scene switches to battle
    expect(move).toHaveBeenLastCalledWith({ vx: 0, vy: 0 });
    inBattle = false; // leaving battle with W still physically held
    expect(move).toHaveBeenCalledTimes(2);
    down = new Set(['KeyW', 'KeyD']);
    subscriber!(edge('KeyD'));
    expect(move.mock.calls).toEqual([[{ vx: 0, vy: -1 }], [{ vx: 0, vy: 0 }], [{ vx: 1, vy: 0 }]]);
  });

  it.each([
    ['has no move', {}],
    ['returns false from move', { move: () => false }],
  ] as const)(
    'stops the lower explore walker when the upper explore %s and a dialogue covers it',
    (_label, upper) => {
      const map = createActionMap();
      const lowerMove = vi.fn();
      const upperHandlers = { ...upper } as ActionHandlers;
      const upperMove = upperHandlers.move === undefined ? undefined : vi.fn(upperHandlers.move);
      map.pushContext('explore', { move: lowerMove });
      map.pushContext('explore', upperMove === undefined ? {} : { move: upperMove });
      map.handle(edge('KeyW'), new Set(['KeyW']));
      map.pushContext('dialogue', { back: vi.fn() });
      expect(lowerMove.mock.calls).toEqual([[{ vx: 0, vy: -1 }], [{ vx: 0, vy: 0 }]]);
      if (upperMove !== undefined) expect(upperMove.mock.calls).toEqual([[{ vx: 0, vy: -1 }]]);
    },
  );

  it('stops a lower explore walker before it is popped', () => {
    const map = createActionMap();
    const lowerMove = vi.fn();
    const popLower = map.pushContext('explore', { move: lowerMove });
    map.pushContext('explore', {});
    map.handle(edge('KeyW'), new Set(['KeyW']));
    popLower();
    expect(lowerMove.mock.calls).toEqual([[{ vx: 0, vy: -1 }], [{ vx: 0, vy: 0 }]]);
  });

  it('accepts Shift+= but leaves Ctrl+= and Meta+= to the browser', () => {
    const map = createActionMap();
    const zoomIn = vi.fn();
    map.pushContext('explore', { zoomIn });
    expect(map.handle(edge('Equal', { shift: true, key: '+' }))).toBe(true);
    expect(map.handle(edge('Equal', { ctrl: true }))).toBe(false);
    expect(map.handle(edge('Equal', { meta: true }))).toBe(false);
    expect(zoomIn).toHaveBeenCalledTimes(1);
  });

  it('ignores composing, editable targets, repeated discrete actions and F5', () => {
    const map = createActionMap();
    const interact = vi.fn();
    map.pushContext('explore', { interact });
    expect(map.handle(edge('KeyF', { composing: true }))).toBe(false);
    expect(map.handle(edge('KeyF', { editableTarget: true }))).toBe(false);
    expect(map.handle(edge('KeyF', { repeat: true }))).toBe(false);
    expect(map.handle(edge('F5'))).toBe(false);
    expect(interact).not.toHaveBeenCalled();
  });

  it('lets dialogue shadow explore so F does not interact', () => {
    const map = createActionMap();
    const interact = vi.fn();
    map.pushContext('explore', { interact });
    const pop = map.pushContext('dialogue', { back: vi.fn() });
    expect(map.handle(edge('KeyF'))).toBe(false);
    expect(interact).not.toHaveBeenCalled();
    pop();
    expect(map.handle(edge('KeyF'))).toBe(true);
  });

  it('connects a fake source, prevents handled keys and releases both listeners', () => {
    const map = createActionMap();
    const zoomIn = vi.fn();
    map.pushContext('explore', { zoomIn });
    let subscriber: KeyboardEdgeListener | undefined;
    const source: KeyboardState = {
      isDown: () => false,
      downCodes: () => new Set(),
      dispose: vi.fn(),
      subscribe(listener) {
        subscriber = listener;
        return () => {
          subscriber = undefined;
        };
      },
    };
    const listeners = new Map<string, Array<(event: KeyboardEvent) => void>>();
    const target: KeyboardDomTarget = {
      addEventListener(type, listener) {
        const rows = listeners.get(type) ?? [];
        rows.push(listener);
        listeners.set(type, rows);
      },
      removeEventListener(type, listener) {
        listeners.set(
          type,
          (listeners.get(type) ?? []).filter((row) => row !== listener),
        );
      },
    };
    const release = map.connect(source, target);
    const preventDefault = vi.fn();
    const event = {
      code: 'Equal',
      key: '=',
      target: null,
      defaultPrevented: false,
      preventDefault,
    } as unknown as KeyboardEvent;
    listeners.get('keydown')![0]!(event);
    subscriber!(edge('Equal'));
    listeners.get('keydown')![1]!(event);
    expect(zoomIn).toHaveBeenCalledOnce();
    expect(preventDefault).toHaveBeenCalledOnce();
    release();
    release();
    expect(subscriber).toBeUndefined();
    expect(listeners.get('keydown')).toHaveLength(0);
    expect(listeners.get('keyup')).toHaveLength(0);
  });

  it('does not invoke or prevent while its connection is disabled', () => {
    const map = createActionMap();
    const navigate = vi.fn();
    map.pushContext('global', { navigate });
    let subscriber: KeyboardEdgeListener | undefined;
    const source: KeyboardState = {
      isDown: () => false,
      downCodes: () => new Set(),
      dispose: vi.fn(),
      subscribe(listener) {
        subscriber = listener;
        return () => {
          subscriber = undefined;
        };
      },
    };
    const listeners: Array<(event: KeyboardEvent) => void> = [];
    const target: KeyboardDomTarget = {
      addEventListener(type, listener) {
        if (type === 'keydown') listeners.push(listener);
      },
      removeEventListener() {},
    };
    map.connect(source, target, () => false);
    const preventDefault = vi.fn();
    const event = {
      code: 'KeyC',
      key: 'c',
      target: null,
      defaultPrevented: false,
      preventDefault,
    } as unknown as KeyboardEvent;
    listeners[0]!(event);
    subscriber!(edge('KeyC'));
    listeners[1]!(event);
    expect(navigate).not.toHaveBeenCalled();
    expect(preventDefault).not.toHaveBeenCalled();
  });
});

describe('screenVectorToHexDir', () => {
  const vectors = [
    [0, 1],
    [-1, 1],
    [-1, 0],
    [-1, -1],
    [0, -1],
    [1, -1],
    [1, 0],
    [1, 1],
  ] as const;
  const table = [
    [0, 5, 4, 4, 3, 2, 1, 1],
    [4, 4, 3, 2, 1, 1, 0, 5],
    [3, 2, 1, 1, 0, 5, 4, 4],
    [1, 1, 0, 5, 4, 4, 3, 2],
  ] as const;
  // Project camera presets (ISO_CAMERA_SPEC yaw 45/135/225/315); table derived independently from
  // the documented rule: desired = yaw + screen offset, nearest of [0,300,240,180,120,60], ties → lower index.
  const presetTable = {
    45: [5, 4, 4, 3, 2, 1, 1, 0],
    135: [4, 3, 2, 1, 1, 0, 5, 4],
    225: [2, 1, 1, 0, 5, 4, 4, 3],
    315: [1, 0, 5, 4, 4, 3, 2, 1],
  } as const;
  it.each([45, 135, 225, 315] as const)('matches the preset 8-direction table at yaw %i', (yaw) => {
    vectors.forEach(([vx, vy], index) => {
      expect(screenVectorToHexDir(vx, vy, yaw)).toBe(presetTable[yaw][index]);
    });
  });
  it.each([45, 135, 225, 315] as const)(
    'agrees with regionKeyboardTarget for W/A/S/D at yaw %i',
    (yaw) => {
      const deltas = [
        [1, 0],
        [1, -1],
        [0, -1],
        [-1, 0],
        [-1, 1],
        [0, 1],
      ] as const;
      for (const [key, vx, vy] of [
        ['w', 0, -1],
        ['a', -1, 0],
        ['s', 0, 1],
        ['d', 1, 0],
      ] as const) {
        const target = regionKeyboardTarget({ q: 0, r: 0 }, key, yaw)!;
        const expected = deltas.findIndex(([q, r]) => q === target.q && r === target.r);
        expect(screenVectorToHexDir(vx, vy, yaw)).toBe(expected);
      }
    },
  );
  it.each([0, 90, 180, 270])('matches the 8-direction table at yaw %i', (yaw) => {
    vectors.forEach(([vx, vy], index) => {
      expect(screenVectorToHexDir(vx, vy, yaw)).toBe(table[yaw / 90]![index]);
    });
  });
  it('rejects a zero or non-finite vector', () => {
    expect(screenVectorToHexDir(0, 0, 0)).toBeNull();
    expect(screenVectorToHexDir(Number.NaN, 1, 0)).toBeNull();
  });
});
