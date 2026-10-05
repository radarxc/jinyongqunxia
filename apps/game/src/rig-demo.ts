import type { Dir8, MotionMode, RigDemoController, RigDemoEquipmentSlot, WeightClass } from '@tianshu/render/rig';
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
const YAWS = [0, 45, 90, 135, 180, 225, 270, 315] as const;
const EQUIPMENT: ReadonlyArray<readonly [RigDemoEquipmentSlot, string]> = [
  ['weapon', '兵器'], ['armor', '盔甲'], ['cape', '披风'], ['feet', '鞋'],
  ['head', '头饰'], ['waist', '腰带'], ['shoulder', '护肩'],
];
const CLIP_KEYS = ['walk', 'sword_regular', 'sword_attack', 'idle', 'hit', 'fall', 'meditate', 'dodge', 'punch', 'run'] as const;
type DemoController = RigDemoController & Partial<Omit<PilotControls, 'stats'>>;
interface PilotModelStatsView { skinnedMeshes: number; joints: number; triangles: number; drawCalls: number }
interface PilotBenchmarkView { instances: number; triangles: number; drawCalls: number; cpuMs: number }
interface PilotStatsView {
  model?: PilotModelStatsView; benchmark?: PilotBenchmarkView; rendererDrawCalls?: number; rendererTriangles?: number;
  directionErrorDeg?: number; skeleton?: string; mappedBones?: number;
}
interface PilotControls {
  readonly clips: readonly string[]; readonly stats: RigDemoController['stats'] & {
    model: PilotModelStatsView; benchmark: PilotBenchmarkView;
    rendererDrawCalls: number; rendererTriangles: number; directionErrorDeg: number; skeleton?: string; mappedBones: number;
  };
  setYaw(value: number): void; setAutoRotate(value: boolean): void; setToon(value: boolean): void;
  setOutline(value: boolean): void; setInstances(value: 1 | 20): void; playGltfClip(name: string): void;
  playTianshuClip(value: unknown, options?: { rate?: number; speedMps?: number }): void; stopAnimation(): void;
}

function select<T extends string>(label: string, values: readonly T[], initial: T, change: (value: T) => void): HTMLLabelElement {
  const wrapper = document.createElement('label'); wrapper.textContent = label; const control = document.createElement('select');
  for (const value of values) { const option = document.createElement('option'); option.value = value; option.textContent = value; option.selected = value === initial; control.append(option); }
  control.addEventListener('change', () => change(control.value as T)); wrapper.append(control); return wrapper;
}
function range(label: string, minimum: number, maximum: number, step: number, initial: number, change: (value: number) => void): HTMLLabelElement {
  const wrapper = document.createElement('label'); const title = document.createElement('span'); const value = document.createElement('output');
  value.textContent = String(initial); title.textContent = label; title.append(' ', value); const control = document.createElement('input');
  control.type = 'range'; control.min = String(minimum); control.max = String(maximum); control.step = String(step); control.value = String(initial);
  control.addEventListener('input', () => { value.textContent = control.value; change(control.valueAsNumber); }); wrapper.append(title, control); return wrapper;
}
function checkbox(label: string, change: (enabled: boolean) => void, pilot = false): HTMLLabelElement {
  const wrapper = document.createElement('label'); if (pilot) wrapper.className = 'pilot-check'; const control = document.createElement('input');
  control.type = 'checkbox'; control.addEventListener('change', () => change(control.checked)); wrapper.append(control, ` ${label}`); return wrapper;
}
function button(label: string, click: () => void): HTMLButtonElement {
  const control = document.createElement('button'); control.type = 'button'; control.textContent = label; control.addEventListener('click', click); return control;
}

function appendPilotControls(panel: HTMLElement, demo: DemoController, modelUrl: string): HTMLOutputElement {
  const divider = document.createElement('h2'); divider.textContent = '3D 试点附加面板';
  const note = document.createElement('p'); note.className = 'pilot-note'; note.textContent = `左 2D / 右 3D · 同一 1.70 m 比例尺与相机 · ${modelUrl}`;
  const status = document.createElement('output'); status.className = 'pilot-status'; status.setAttribute('aria-live', 'polite');
  const directions = document.createElement('fieldset'); directions.className = 'pilot-yaws';
  const legend = document.createElement('legend'); legend.textContent = '8 方向转台（偏航）'; directions.append(legend);
  for (const yaw of YAWS) { const control = button(`${yaw}°`, () => demo.setYaw?.(yaw)); control.dataset['yaw'] = String(yaw); directions.append(control); }
  const clips = demo.clips?.length ? demo.clips : ['（GLB 无自带动画）'];
  panel.append(
    divider, note, status, directions, checkbox('自动旋转', enabled => demo.setAutoRotate?.(enabled), true),
    checkbox('Toon 三阶（关=原材质）', enabled => demo.setToon?.(enabled), true),
    checkbox('反面扩张描边', enabled => demo.setOutline?.(enabled), true),
    select('3D 实例', ['1', '20'] as const, '1', value => demo.setInstances?.(value === '20' ? 20 : 1)),
    select('GLB 动画', clips, clips[0]!, value => { if (demo.clips?.length) demo.playGltfClip?.(value); }),
    select('天书片段重定向', ['none', 'walk', 'sword'] as const, 'none', value => {
      if (value === 'none') demo.stopAnimation?.();
      else demo.playTianshuClip?.(value === 'walk' ? clipWalk : clipSword, value === 'walk' ? { speedMps: .78 } : undefined);
    }),
  );
  (panel.querySelectorAll<HTMLInputElement>('.pilot-check input')[1]!).checked = true;
  return status;
}

async function createDemo(canvas: HTMLCanvasElement, modelUrl: string | null, onEvent: (event: string, key: string) => void): Promise<DemoController> {
  if (!modelUrl) {
    const rig = await import('@tianshu/render/rig');
    return rig.createRigDemoScene(canvas, onEvent);
  }
  const pilot = await import('../../../packages/render/src/gltf/demo');
  return pilot.createPilotDemoScene(canvas, { modelUrl, onClipEvent: onEvent }) as Promise<DemoController>;
}

export async function mountRigDemo(root: HTMLElement, canvas: HTMLCanvasElement): Promise<() => void> {
  const modelUrl = new URL(location.href).searchParams.get('model');
  const rig = await import('@tianshu/render/rig');
  for (const clip of [clipDodge, clipFall, clipHit, clipIdle, clipMeditate, clipPunch, clipRun, clipSword, clipWalk])
    if (!rig.getRigClip(clip.id)) rig.registerRigClip(clip);
  const eventLog: string[] = []; const onEvent = (event: string, key: string): void => {
    eventLog.unshift(`${new Date().toLocaleTimeString()} · ${key} · ${event}`); eventLog.length = Math.min(6, eventLog.length);
  };
  let pilotError = ''; let demo: DemoController;
  try { demo = await createDemo(canvas, modelUrl, onEvent); }
  catch (error) {
    if (!modelUrl) throw error; pilotError = error instanceof Error ? error.message : String(error);
    demo = await createDemo(canvas, null, onEvent);
  }
  demo.setClipMap(JSON.parse(clipMapSource));
  const panel = document.createElement('aside'); panel.id = 'rig-demo'; panel.setAttribute('aria-label', '角色步态演示控制台');
  if (modelUrl) panel.classList.add('has-pilot');
  const title = document.createElement('h1'); title.textContent = '角色分层部件 · 程序/片段 A/B';
  const stats = document.createElement('output'); stats.setAttribute('aria-live', 'polite');
  const events = document.createElement('output'); events.className = 'rig-event-log'; events.textContent = '事件日志：等待动作';
  let direction: Dir8 = 1; const directionLabel = document.createElement('label'); directionLabel.textContent = '方向';
  const directionSelect = document.createElement('select');
  DIRECTIONS.forEach((name, index) => { const option = document.createElement('option'); option.value = String(index); option.textContent = `${index} · ${name}`; option.selected = index === direction; directionSelect.append(option); });
  directionSelect.addEventListener('change', () => { direction = Number(directionSelect.value) as Dir8; demo.setDirection(direction); }); directionLabel.append(directionSelect);
  const equipmentGroup = document.createElement('fieldset'); const legend = document.createElement('legend'); legend.textContent = '装备覆盖层'; equipmentGroup.append(legend);
  for (const [slot, label] of EQUIPMENT) equipmentGroup.append(checkbox(label, enabled => void demo.setEquipment(slot, enabled)));
  let clipKey: (typeof CLIP_KEYS)[number] = 'walk';
  panel.append(
    title, select<MotionMode>('动作', ['idle', 'walk', 'run'], 'walk', value => demo.setMotion(value)), directionLabel,
    select<WeightClass>('重量', ['light', 'medium', 'heavy'], 'medium', value => demo.setWeight(value)),
    range('速度 m/s', 0, 5.5, .05, 1, value => demo.setSpeed(value)),
    range('步态采样 fps（0=连续）', 0, 24, 1, 12, value => demo.setStepFps(value)),
    checkbox('动作库步态（关=程序步态 A/B）', enabled => demo.setClipMode(enabled)),
    checkbox('8 方向轮播', enabled => demo.setDirectionCycle(enabled)),
    select('片段', CLIP_KEYS, clipKey, value => { clipKey = value; }),
    button('播放所选片段', () => demo.playClipKey(clipKey)),
    button('播放剑招', () => demo.playClipKey('sword_attack')), equipmentGroup,
    checkbox('20 个角色压力场景', enabled => demo.setStress(enabled)), stats, events,
  );
  let pilotStatus: HTMLOutputElement | undefined;
  if (modelUrl && !pilotError) pilotStatus = appendPilotControls(panel, demo, modelUrl);
  else if (modelUrl) {
    const divider = document.createElement('h2'); divider.textContent = '3D 试点附加面板';
    pilotStatus = document.createElement('output'); pilotStatus.className = 'pilot-status';
    pilotStatus.textContent = `3D 模型加载失败，已保留 2D 演示：${pilotError}`; panel.append(divider, pilotStatus);
  }
  root.append(panel);

  let frame = 0; let lastHud = 0;
  const resize = (): void => demo.resize(canvas.clientWidth, canvas.clientHeight, window.devicePixelRatio);
  const draw = (timeMs: number): void => {
    demo.render(timeMs);
    if (timeMs - lastHud >= 250) {
      const value = demo.stats;
      stats.textContent = `帧 ${value.frameTimeMs.toFixed(2)} ms · rig CPU ${value.rigCpuMs.toFixed(3)} ms\n` +
        `总 draw ${value.drawCalls} · 人形 draw ${value.rigDrawCalls}\n` +
        `角色 ${value.characters} · 实例 ${value.instances} · 上传区间 ${value.uploadedRanges}\n程序占位部件 ${value.placeholders}/39`;
      events.textContent = `事件日志：\n${eventLog.join('\n') || '等待动作'}`;
      if (pilotStatus && !pilotError) {
        const pilot = value as RigDemoController['stats'] & PilotStatsView; const model = pilot.model; const benchmark = pilot.benchmark;
        if (model && benchmark) pilotStatus.textContent = `模型 ${model.skinnedMeshes ? `有 skin / ${model.joints} joints` : '无 skin'} · ${model.triangles.toLocaleString()} 三角面 · ${model.drawCalls} draw/material\n` +
          `3D ${benchmark.instances} 个：${benchmark.triangles.toLocaleString()} 三角面 · ${benchmark.drawCalls} draw · CPU ${benchmark.cpuMs.toFixed(2)} ms（120 帧平均）\n` +
          `全场实渲：${(pilot.rendererTriangles ?? 0).toLocaleString()} 三角面 · ${pilot.rendererDrawCalls ?? 0} draw\n` +
          `骨架 ${pilot.skeleton ?? '未映射'} · 映射 ${pilot.mappedBones ?? 0} 根 · 方向误差峰值 ${(pilot.directionErrorDeg ?? 0).toFixed(2)}°`;
      }
      lastHud = timeMs;
    }
    frame = requestAnimationFrame(draw);
  };
  resize(); window.addEventListener('resize', resize, { passive: true }); frame = requestAnimationFrame(draw);
  return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', resize); panel.remove(); demo.dispose(); };
}
