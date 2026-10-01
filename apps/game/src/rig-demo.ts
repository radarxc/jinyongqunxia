import type { Dir8, MotionMode, RigDemoEquipmentSlot, WeightClass } from '@tianshu/render/rig';

const DIRECTIONS = ['南', '西南', '西', '西北', '北', '东北', '东', '东南'] as const;
const EQUIPMENT: ReadonlyArray<readonly [RigDemoEquipmentSlot, string]> = [
  ['weapon', '兵器'], ['armor', '盔甲'], ['cape', '披风'], ['feet', '鞋'],
  ['head', '头饰'], ['waist', '腰带'], ['shoulder', '护肩'],
];

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
  const { createRigDemoScene } = await import('@tianshu/render/rig');
  const demo = await createRigDemoScene(canvas);
  const panel = document.createElement('aside'); panel.id = 'rig-demo'; panel.setAttribute('aria-label', '角色步态演示控制台');
  const title = document.createElement('h1'); title.textContent = '角色分层部件与代码步态';
  const stats = document.createElement('output'); stats.setAttribute('aria-live', 'polite');
  let direction: Dir8 = 1;
  const directionLabel = document.createElement('label'); directionLabel.textContent = '方向';
  const directionSelect = document.createElement('select');
  DIRECTIONS.forEach((name, index) => { const option = document.createElement('option'); option.value = String(index); option.textContent = `${index} · ${name}`; option.selected = index === direction; directionSelect.append(option); });
  directionSelect.addEventListener('change', () => { direction = Number(directionSelect.value) as Dir8; demo.setDirection(direction); }); directionLabel.append(directionSelect);
  const equipmentGroup = document.createElement('fieldset'); const legend = document.createElement('legend'); legend.textContent = '装备覆盖层'; equipmentGroup.append(legend);
  for (const [slot, label] of EQUIPMENT) equipmentGroup.append(checkbox(label, (enabled) => void demo.setEquipment(slot, enabled)));
  panel.append(
    title,
    select<MotionMode>('动作', ['idle', 'walk', 'run'], 'walk', (value) => demo.setMotion(value)),
    directionLabel,
    select<WeightClass>('重量', ['light', 'medium', 'heavy'], 'medium', (value) => demo.setWeight(value)),
    range('速度 m/s', 0, 5.5, .05, 1.4, (value) => demo.setSpeed(value)),
    range('步态采样 fps（0=连续）', 0, 24, 1, 12, (value) => demo.setStepFps(value)),
    equipmentGroup, checkbox('20 个角色压力场景', (enabled) => demo.setStress(enabled)), stats,
  );
  root.append(panel);

  let frame = 0; let lastHud = 0;
  const resize = (): void => demo.resize(canvas.clientWidth, canvas.clientHeight, window.devicePixelRatio);
  const draw = (timeMs: number): void => {
    demo.render(timeMs);
    if (timeMs - lastHud >= 250) { const value = demo.stats; stats.textContent = `帧 ${value.frameTimeMs.toFixed(2)} ms · rig CPU ${value.rigCpuMs.toFixed(3)} ms\n总 draw ${value.drawCalls} · 人形 draw ${value.rigDrawCalls}\n角色 ${value.characters} · 实例 ${value.instances} · 上传区间 ${value.uploadedRanges}\n程序占位部件 ${value.placeholders}/39`; lastHud = timeMs; }
    frame = requestAnimationFrame(draw);
  };
  resize(); window.addEventListener('resize', resize, { passive: true }); frame = requestAnimationFrame(draw);
  return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', resize); panel.remove(); demo.dispose(); };
}
