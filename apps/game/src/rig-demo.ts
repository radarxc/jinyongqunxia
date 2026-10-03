import type { Dir8, MotionMode, RigDemoEquipmentSlot, WeightClass } from '@tianshu/render/rig';
import clipMapSource from '../../../content/anim/clip-map.yaml?raw';
import clipDodge from '../../../assets/default/rig/clips/clip_dodge_back.json';
import clipFall from '../../../assets/default/rig/clips/clip_fall.json';
import clipHit from '../../../assets/default/rig/clips/clip_hit_chest.json';
import clipIdle from '../../../assets/default/rig/clips/clip_idle.json';
import clipMeditate from '../../../assets/default/rig/clips/clip_meditate.json';
import clipPunch from '../../../assets/default/rig/clips/clip_punch_jab.json';
import clipRun from '../../../assets/default/rig/clips/clip_run.json';
import clipSword from '../../../assets/default/rig/clips/clip_sword_attack.json';
import clipWalk from '../../../assets/default/rig/clips/clip_walk.json';

const DIRECTIONS = ['南', '西南', '西', '西北', '北', '东北', '东', '东南'] as const;
const EQUIPMENT: ReadonlyArray<readonly [RigDemoEquipmentSlot, string]> = [
  ['weapon', '兵器'], ['armor', '盔甲'], ['cape', '披风'], ['feet', '鞋'],
  ['head', '头饰'], ['waist', '腰带'], ['shoulder', '护肩'],
];
const CLIP_KEYS = ['walk', 'sword_regular', 'sword_attack', 'idle', 'hit', 'fall', 'meditate', 'dodge', 'punch', 'run'] as const;

function select<T extends string>(label: string, values: readonly T[], initial: T, change: (value: T) => void): HTMLLabelElement {
  const wrapper = document.createElement('label'); wrapper.textContent = label;
  const control = document.createElement('select');
  for (const value of values) { const option = document.createElement('option'); option.value = value; option.textContent = value; option.selected = value === initial; control.append(option); }
  control.addEventListener('change', () => change(control.value as T)); wrapper.append(control); return wrapper;
}

function range(label: string, minimum: number, maximum: number, step: number, initial: number, change: (value: number) => void): HTMLLabelElement {
  const wrapper = document.createElement('label'); const title = document.createElement('span');
  const value = document.createElement('output'); value.textContent = String(initial); title.textContent = label; title.append(' ', value);
  const control = document.createElement('input'); control.type = 'range'; control.min = String(minimum); control.max = String(maximum); control.step = String(step); control.value = String(initial);
  control.addEventListener('input', () => { value.textContent = control.value; change(control.valueAsNumber); }); wrapper.append(title, control); return wrapper;
}

function checkbox(label: string, change: (enabled: boolean) => void): HTMLLabelElement {
  const wrapper = document.createElement('label'); const control = document.createElement('input'); control.type = 'checkbox';
  control.addEventListener('change', () => change(control.checked)); wrapper.append(control, ` ${label}`); return wrapper;
}

export async function mountRigDemo(root: HTMLElement, canvas: HTMLCanvasElement): Promise<() => void> {
  const rig = await import('@tianshu/render/rig');
  for (const clip of [clipDodge, clipFall, clipHit, clipIdle, clipMeditate, clipPunch, clipRun, clipSword, clipWalk])
    if (!rig.getRigClip(clip.id)) rig.registerRigClip(clip);
  const eventLog: string[] = []; const demo = await rig.createRigDemoScene(canvas, (event, key) => {
    eventLog.unshift(`${new Date().toLocaleTimeString()} · ${key} · ${event}`); eventLog.length = Math.min(6, eventLog.length);
  });
  demo.setClipMap(JSON.parse(clipMapSource));
  const panel = document.createElement('aside'); panel.id = 'rig-demo'; panel.setAttribute('aria-label', '角色步态演示控制台');
  const title = document.createElement('h1'); title.textContent = '角色分层部件 · 程序/片段 A/B';
  const stats = document.createElement('output'); stats.setAttribute('aria-live', 'polite');
  const events = document.createElement('output'); events.className = 'rig-event-log'; events.textContent = '事件日志：等待动作';
  let direction: Dir8 = 1;
  const directionLabel = document.createElement('label'); directionLabel.textContent = '方向';
  const directionSelect = document.createElement('select');
  DIRECTIONS.forEach((name, index) => { const option = document.createElement('option'); option.value = String(index); option.textContent = `${index} · ${name}`; option.selected = index === direction; directionSelect.append(option); });
  directionSelect.addEventListener('change', () => { direction = Number(directionSelect.value) as Dir8; demo.setDirection(direction); }); directionLabel.append(directionSelect);
  const equipmentGroup = document.createElement('fieldset'); const legend = document.createElement('legend'); legend.textContent = '装备覆盖层'; equipmentGroup.append(legend);
  for (const [slot, label] of EQUIPMENT) equipmentGroup.append(checkbox(label, (enabled) => void demo.setEquipment(slot, enabled)));
  let clipKey: (typeof CLIP_KEYS)[number] = 'walk';
  panel.append(
    title,
    select<MotionMode>('动作', ['idle', 'walk', 'run'], 'walk', (value) => demo.setMotion(value)),
    directionLabel,
    select<WeightClass>('重量', ['light', 'medium', 'heavy'], 'medium', (value) => demo.setWeight(value)),
    range('速度 m/s', 0, 5.5, .05, 1, (value) => demo.setSpeed(value)),
    range('步态采样 fps（0=连续）', 0, 24, 1, 12, (value) => demo.setStepFps(value)),
    checkbox('动作库步态（关=程序步态 A/B）', (enabled) => demo.setClipMode(enabled)),
    checkbox('8 方向轮播', (enabled) => demo.setDirectionCycle(enabled)),
    select('片段', CLIP_KEYS, clipKey, (value) => { clipKey = value; }),
    (() => { const button = document.createElement('button'); button.type = 'button'; button.textContent = '播放所选片段';
      button.addEventListener('click', () => demo.playClipKey(clipKey)); return button; })(),
    (() => { const button = document.createElement('button'); button.type = 'button'; button.textContent = '播放剑招';
      button.addEventListener('click', () => demo.playClipKey('sword_attack')); return button; })(),
    equipmentGroup, checkbox('20 个角色压力场景', (enabled) => demo.setStress(enabled)), stats, events,
  );
  root.append(panel);

  let frame = 0; let lastHud = 0;
  const resize = (): void => demo.resize(canvas.clientWidth, canvas.clientHeight, window.devicePixelRatio);
  const draw = (timeMs: number): void => {
    demo.render(timeMs);
    if (timeMs - lastHud >= 250) { const value = demo.stats; stats.textContent = `帧 ${value.frameTimeMs.toFixed(2)} ms · rig CPU ${value.rigCpuMs.toFixed(3)} ms\n总 draw ${value.drawCalls} · 人形 draw ${value.rigDrawCalls}\n角色 ${value.characters} · 实例 ${value.instances} · 上传区间 ${value.uploadedRanges}\n程序占位部件 ${value.placeholders}/39`;
      events.textContent = `事件日志：\n${eventLog.join('\n') || '等待动作'}`; lastHud = timeMs; }
    frame = requestAnimationFrame(draw);
  };
  resize(); window.addEventListener('resize', resize, { passive: true }); frame = requestAnimationFrame(draw);
  return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', resize); panel.remove(); demo.dispose(); };
}
