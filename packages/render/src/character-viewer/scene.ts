import {
  ACESFilmicToneMapping,
  AmbientLight,
  AnimationMixer,
  Box3,
  Color,
  CylinderGeometry,
  DirectionalLight,
  GridHelper,
  Group,
  Mesh,
  MeshStandardMaterial,
  NoToneMapping,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShadowMaterial,
  SkeletonHelper,
  SkinnedMesh,
  Vector3,
  WebGLRenderer,
  type AnimationAction,
  type AnimationClip,
  type Material,
  type Object3D,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import type {
  CharacterModelMeta,
  CharacterPresetView,
  CharacterViewerController,
  CharacterViewerStats,
  AttachedPropOptions,
} from './types';

interface CameraPresetTarget {
  readonly position: Vector3;
  readonly target: Vector3;
}

const PRESET_MAP: Record<CharacterPresetView, CameraPresetTarget> = {
  full: {
    position: new Vector3(0, 1.15, 2.7),
    target: new Vector3(0, 0.88, 0),
  },
  face: {
    position: new Vector3(0.04, 1.56, 0.48),
    target: new Vector3(0, 1.55, 0),
  },
  neck: {
    position: new Vector3(0.12, 1.42, 0.35),
    target: new Vector3(0, 1.42, 0),
  },
  back: {
    position: new Vector3(0, 1.15, -2.7),
    target: new Vector3(0, 0.88, 0),
  },
  legs: {
    position: new Vector3(0, 0.55, 1.7),
    target: new Vector3(0, 0.48, 0),
  },
};

function countTriangles(mesh: Mesh): number {
  const geometry = mesh.geometry;
  const count =
    geometry.index?.count ?? geometry.attributes['position']?.count ?? 0;
  return Math.floor(count / 3);
}

/** Create the shared preview loader configuration required by packed dressup GLBs. */
export function createCharacterViewerLoader(): GLTFLoader {
  return new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
}

export function createCharacterViewer(
  canvas: HTMLCanvasElement,
): CharacterViewerController {
  // 1. Renderer Setup
  const renderer = new WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
    preserveDrawingBuffer: true,
  });
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;
  renderer.setClearColor(new Color(0x121316), 1);

  // 2. Scene & Camera
  const scene = new Scene();
  const camera = new PerspectiveCamera(38, canvas.clientWidth / canvas.clientHeight, 0.05, 50);
  camera.position.copy(PRESET_MAP.full.position);

  // 3. OrbitControls
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 0.15;
  controls.maxDistance = 8.0;
  controls.target.copy(PRESET_MAP.full.target);
  controls.update();

  // 4. Lighting System
  const ambientLight = new AmbientLight(0xffffff, 0.85);
  scene.add(ambientLight);

  const keyLight = new DirectionalLight(0xfff6eb, 2.2);
  keyLight.position.set(2.5, 4.0, 3.0);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 1024;
  keyLight.shadow.mapSize.height = 1024;
  keyLight.shadow.bias = -0.0005;
  scene.add(keyLight);

  const fillLight = new DirectionalLight(0xcbe2f8, 0.95);
  fillLight.position.set(-2.8, 2.2, 2.0);
  scene.add(fillLight);

  const rimLight = new DirectionalLight(0xffffff, 2.2);
  rimLight.position.set(0, 3.5, -3.2);
  scene.add(rimLight);

  // 5. Studio Pedestal & Floor
  const pedestalGroup = new Group();
  const pedestalGeom = new CylinderGeometry(1.2, 1.25, 0.02, 64);
  const pedestalMat = new MeshStandardMaterial({
    color: 0x1a1c22,
    roughness: 0.8,
    metalness: 0.15,
  });
  const pedestalMesh = new Mesh(pedestalGeom, pedestalMat);
  pedestalMesh.position.y = -0.01;
  pedestalMesh.receiveShadow = true;
  pedestalGroup.add(pedestalMesh);

  // Decorative subtle gold rim on pedestal
  const ringGeom = new CylinderGeometry(1.25, 1.26, 0.005, 64);
  const ringMat = new MeshStandardMaterial({
    color: 0xa0834a,
    roughness: 0.3,
    metalness: 0.8,
  });
  const ringMesh = new Mesh(ringGeom, ringMat);
  ringMesh.position.y = -0.002;
  pedestalGroup.add(ringMesh);

  // Shadow catcher
  const shadowPlaneGeom = new PlaneGeometry(6, 6);
  const shadowPlaneMat = new ShadowMaterial({ opacity: 0.45 });
  const shadowPlane = new Mesh(shadowPlaneGeom, shadowPlaneMat);
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = 0.001;
  shadowPlane.receiveShadow = true;
  pedestalGroup.add(shadowPlane);

  // Grid
  const grid = new GridHelper(6, 12, 0x483e30, 0x252320);
  grid.position.y = 0.002;
  pedestalGroup.add(grid);

  scene.add(pedestalGroup);

  // 6. Character Container & State
  const modelAnchor = new Group();
  scene.add(modelAnchor);

  let currentModelGroup: Group | undefined;
  let skeletonHelper: SkeletonHelper | undefined;
  let mixer: AnimationMixer | undefined;
  let actions: Map<string, AnimationAction> = new Map();
  let currentAction: AnimationAction | undefined;
  let currentClipName = '';
  let isPlaying = true;
  let timeScale = 1.0;
  let isWireframe = false;
  let activeMeshes: Mesh[] = [];
  const externalRoots = new Set<Object3D>();

  // Smooth camera lerp targets
  let lerpCameraTarget: Vector3 | null = null;
  let lerpCameraPosition: Vector3 | null = null;

  // Stats tracking
  let lastFrameTime = performance.now();
  let frameCount = 0;
  let fps = 60;
  let lastFpsSample = performance.now();
  let frameDurationMs = 16.6;
  let currentMeta: CharacterModelMeta = {
    name: '',
    triangles: 0,
    meshes: 0,
    skinnedMeshes: 0,
    joints: 0,
    clips: [],
    heightM: 1.68,
  };

  const gltfLoader = createCharacterViewerLoader();

  function applyWireframe(enabled: boolean): void {
    isWireframe = enabled;
    for (const mesh of activeMeshes) {
      const mats = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material];
      for (const m of mats) {
        if (m) (m as Material & { wireframe?: boolean }).wireframe = enabled;
      }
    }
  }

  async function loadModel(
    url: string,
    targetHeightM = 1.68,
  ): Promise<CharacterModelMeta> {
    // Clean up previous model
    if (currentModelGroup) {
      clearProps();
      if (mixer) mixer.stopAllAction();
      if (skeletonHelper) {
        scene.remove(skeletonHelper);
        skeletonHelper.dispose();
        skeletonHelper = undefined;
      }
      modelAnchor.remove(currentModelGroup);
      for (const mesh of activeMeshes) {
        mesh.geometry.dispose();
      }
      activeMeshes = [];
      actions.clear();
      currentAction = undefined;
    }

    const gltf = await gltfLoader.loadAsync(url);
    const modelScene = gltf.scene;

    // Collect meshes & joints
    const meshes: Mesh[] = [];
    let skinnedCount = 0;
    const joints = new Set<Object3D>();

    modelScene.traverse((node: Object3D) => {
      if (node instanceof Mesh) {
        meshes.push(node);
        node.castShadow = true;
        node.receiveShadow = true;
        if (node instanceof SkinnedMesh) {
          skinnedCount += 1;
          for (const bone of node.skeleton.bones) {
            joints.add(bone);
          }
        }
      }
    });

    activeMeshes = meshes;

    // Compute posed world bounds. geometry.boundingBox is unreliable after meshopt quantization.
    modelScene.updateMatrixWorld(true);
    const geomBox = new Box3().setFromObject(modelScene, true);

    const size = geomBox.getSize(new Vector3());
    const sourceHeight = size.y > 0.01 ? size.y : targetHeightM;
    const scale = targetHeightM / sourceHeight;
    modelScene.scale.setScalar(scale);

    // Place feet at y = 0 and center in XZ
    const center = geomBox.getCenter(new Vector3());
    modelScene.position.x = -center.x * scale;
    modelScene.position.y = -geomBox.min.y * scale;
    modelScene.position.z = -center.z * scale;
    modelScene.updateMatrixWorld(true);

    modelAnchor.add(modelScene);
    currentModelGroup = modelScene;

    // Skeleton Helper
    if (skinnedCount > 0) {
      skeletonHelper = new SkeletonHelper(modelScene);
      skeletonHelper.visible = false;
      scene.add(skeletonHelper);
    }

    // Animation Clips
    mixer = new AnimationMixer(modelScene);
    actions = new Map();
    const clipNames: string[] = [];

    for (const clip of gltf.animations as AnimationClip[]) {
      const action = mixer.clipAction(clip);
      actions.set(clip.name, action);
      clipNames.push(clip.name);
    }

    // Default animation
    const preferredOrder = ['idle', 'walk', 'run'];
    let defaultClip = clipNames.find((n) =>
      preferredOrder.includes(n.toLowerCase()),
    );
    if (!defaultClip && clipNames.length > 0) defaultClip = clipNames[0];

    if (defaultClip) {
      playClip(defaultClip, 0);
    }

    const totalTriangles = meshes.reduce(
      (sum, m) => sum + countTriangles(m),
      0,
    );
    const modelName = url.split('/').filter(Boolean).slice(-2)[0] ?? 'model';

    currentMeta = {
      name: modelName,
      triangles: totalTriangles,
      meshes: meshes.length,
      skinnedMeshes: skinnedCount,
      joints: joints.size,
      clips: clipNames,
      heightM: targetHeightM,
      headRatio: 7.7,
      legRatio: 53.4,
    };

    if (isWireframe) applyWireframe(true);

    if (typeof window !== 'undefined') {
      (window as unknown as { __viewer_debug: unknown }).__viewer_debug = {
        renderer,
        modelScene,
        camera,
        controls,
        scene,
        geomBox,
        size,
        scale,
        sourceHeight,
        modelScale: modelScene.scale.toArray(),
        modelPos: modelScene.position.toArray(),
        cameraPos: camera.position.toArray(),
        targetPos: controls.target.toArray(),
      };
    }

    return currentMeta;
  }

  function playClip(name: string, fadeDuration = 0.3): void {
    if (!mixer) return;
    const targetAction = actions.get(name);
    if (!targetAction) return;

    if (currentAction && currentAction !== targetAction) {
      targetAction.reset();
      targetAction.timeScale = timeScale;
      targetAction.play();
      currentAction.crossFadeTo(targetAction, fadeDuration, true);
    } else {
      targetAction.reset();
      targetAction.timeScale = timeScale;
      targetAction.play();
    }

    currentAction = targetAction;
    currentClipName = name;
    isPlaying = true;
  }

  function pauseAnimation(): void {
    if (currentAction) {
      currentAction.paused = true;
      isPlaying = false;
    }
  }

  function resumeAnimation(): void {
    if (currentAction) {
      currentAction.paused = false;
      isPlaying = true;
    }
  }

  function setTimeScale(scale: number): void {
    timeScale = scale;
    if (currentAction) {
      currentAction.timeScale = scale;
    }
  }

  function seekTime(seconds: number): void {
    if (currentAction && mixer) {
      currentAction.time = seconds;
      mixer.update(0);
    }
  }

  function setCameraPreset(
    preset: CharacterPresetView,
    smooth = true,
  ): void {
    const config = PRESET_MAP[preset];
    if (!config) return;

    if (smooth) {
      lerpCameraPosition = config.position.clone();
      lerpCameraTarget = config.target.clone();
    } else {
      camera.position.copy(config.position);
      controls.target.copy(config.target);
      controls.update();
      lerpCameraPosition = null;
      lerpCameraTarget = null;
    }
  }

  function setWireframe(enabled: boolean): void {
    applyWireframe(enabled);
  }

  function setSkeleton(enabled: boolean): void {
    if (skeletonHelper) {
      skeletonHelper.visible = enabled;
    }
  }

  function setGrid(enabled: boolean): void {
    grid.visible = enabled;
  }

  function setAutoRotate(enabled: boolean, speed = 1.0): void {
    controls.autoRotate = enabled;
    controls.autoRotateSpeed = speed * 2.0;
  }

  function setExposure(exposure: number): void {
    renderer.toneMappingExposure = exposure;
  }

  function attachExternal(root: Object3D): void {
    if (externalRoots.has(root)) return;
    externalRoots.add(root);
    modelAnchor.add(root);
    if (currentModelGroup) currentModelGroup.visible = false;
  }

  function detachExternal(root: Object3D): void {
    if (!externalRoots.delete(root)) return;
    root.removeFromParent();
    if (externalRoots.size === 0 && currentModelGroup) currentModelGroup.visible = true;
  }

  function setUnlitMode(on: boolean): void {
    renderer.toneMapping = on ? NoToneMapping : ACESFilmicToneMapping;
  }

  function setLightIntensity(factor: number): void {
    keyLight.intensity = 2.2 * factor;
    fillLight.intensity = 0.95 * factor;
    rimLight.intensity = 2.2 * factor;
    ambientLight.intensity = 0.85 * factor;
  }

  function resize(width: number, height: number, dpr = 1): void {
    if (width <= 0 || height <= 0) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height, false);
  }

  function getStats(): CharacterViewerStats {
    let currentTime = 0;
    let duration = 0;
    if (currentAction) {
      duration = currentAction.getClip().duration;
      currentTime = duration > 0 ? (currentAction.time % duration) : 0;
    }
    return {
      fps,
      frameTimeMs: frameDurationMs,
      currentClip: currentClipName,
      currentTime,
      duration,
      isPlaying,
      triangles: currentMeta.triangles,
      skinnedMeshes: currentMeta.skinnedMeshes,
      joints: currentMeta.joints,
    };
  }

  // Animation Loop
  let animId = 0;
  let disposed = false;

  function loop(now: number): void {
    if (disposed) return;
    const delta = Math.min((now - lastFrameTime) / 1000, 0.1);
    frameDurationMs = now - lastFrameTime;
    lastFrameTime = now;

    // FPS computation
    frameCount += 1;
    if (now - lastFpsSample >= 500) {
      fps = Math.round((frameCount * 1000) / (now - lastFpsSample));
      frameCount = 0;
      lastFpsSample = now;
    }

    // Camera preset smooth transition
    if (lerpCameraPosition && lerpCameraTarget) {
      camera.position.lerp(lerpCameraPosition, 0.08);
      controls.target.lerp(lerpCameraTarget, 0.08);
      if (
        camera.position.distanceTo(lerpCameraPosition) < 0.005 &&
        controls.target.distanceTo(lerpCameraTarget) < 0.005
      ) {
        camera.position.copy(lerpCameraPosition);
        controls.target.copy(lerpCameraTarget);
        lerpCameraPosition = null;
        lerpCameraTarget = null;
      }
    }

    controls.update();

    if (mixer && isPlaying) {
      mixer.update(delta);
    }

    renderer.render(scene, camera);
    animId = requestAnimationFrame(loop);
  }

  animId = requestAnimationFrame(loop);

  function captureScreenshot(mimeType = 'image/jpeg', quality = 0.95): string {
    renderer.render(scene, camera);
    return canvas.toDataURL(mimeType, quality);
  }

  interface PropRecord {
    readonly id: string;
    readonly group: Group;
    readonly slot: string;
    readonly parent: Object3D;
  }
  const attachedProps = new Map<string, PropRecord>();

  function detachProp(id: string): void {
    const rec = attachedProps.get(id);
    if (!rec) return;
    rec.parent.remove(rec.group);
    rec.group.traverse((child) => {
      if (child instanceof Mesh) {
        child.geometry.dispose();
      }
    });
    attachedProps.delete(id);
  }

  function clearProps(): void {
    for (const id of Array.from(attachedProps.keys())) {
      detachProp(id);
    }
  }

  function getAttachedProps(): readonly string[] {
    return Array.from(attachedProps.keys());
  }

  async function attachProp(
    id: string,
    url: string,
    options: AttachedPropOptions,
  ): Promise<void> {
    detachProp(id);
    if (!currentModelGroup) return;

    let targetParent: Object3D | null = null;

    if (options.slot === 'root') {
      targetParent = modelAnchor;
    } else {
      const boneMap: Record<string, string[]> = {
        head: ['mixamorigHead', 'mixamorig:Head', 'Head', 'head'],
        hips: ['mixamorigHips', 'mixamorig:Hips', 'Hips', 'hips'],
        rightHand: ['mixamorigRightHand', 'mixamorig:RightHand', 'RightHand', 'rightHand'],
        leftHand: ['mixamorigLeftHand', 'mixamorig:LeftHand', 'LeftHand', 'leftHand'],
        chest: ['mixamorigSpine2', 'mixamorigChest', 'mixamorig:Spine2', 'Chest', 'chest'],
        spine: ['mixamorigSpine', 'mixamorig:Spine', 'Spine', 'spine'],
      };
      const candidates = boneMap[options.slot] || [options.slot];
      currentModelGroup.traverse((node: Object3D) => {
        if (targetParent) return;
        for (const name of candidates) {
          if (node.name === name || node.name.endsWith(':' + name)) {
            targetParent = node;
            break;
          }
        }
      });
    }

    if (!targetParent) {
      targetParent = modelAnchor;
    }

    const gltf = await gltfLoader.loadAsync(url);
    const propScene = gltf.scene;


    propScene.traverse((node: Object3D) => {
      if (node instanceof Mesh) {
        node.castShadow = true;
        node.receiveShadow = true;
        activeMeshes.push(node);
      }
    });

    const box = new Box3().setFromObject(propScene);
    const center = box.getCenter(new Vector3());

    const container = new Group();
    container.name = `prop_${id}`;

    if (typeof options.scale === 'number') {
      container.scale.setScalar(options.scale);
    } else if (Array.isArray(options.scale)) {
      container.scale.set(options.scale[0], options.scale[1], options.scale[2]);
    }

    if (options.rotation) {
      container.rotation.set(options.rotation[0], options.rotation[1], options.rotation[2]);
    }

    if (options.offset) {
      container.position.set(options.offset[0], options.offset[1], options.offset[2]);
    }

    propScene.position.x = -center.x;
    propScene.position.y = -center.y;
    propScene.position.z = -center.z;

    container.add(propScene);
    targetParent.add(container);

    attachedProps.set(id, {
      id,
      group: container,
      slot: options.slot,
      parent: targetParent,
    });
  }

  function dispose(): void {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(animId);
    controls.dispose();
    clearProps();
    for (const root of externalRoots) root.removeFromParent();
    externalRoots.clear();
    if (mixer) mixer.stopAllAction();
    if (skeletonHelper) skeletonHelper.dispose();
    renderer.dispose();
  }

  return {
    loadModel,
    playClip,
    pauseAnimation,
    resumeAnimation,
    setTimeScale,
    seekTime,
    setCameraPreset,
    setWireframe,
    setSkeleton,
    setGrid,
    setAutoRotate,
    setExposure,
    setLightIntensity,
    resize,
    getStats,
    captureScreenshot,
    attachProp,
    detachProp,
    clearProps,
    getAttachedProps,
    attachExternal,
    detachExternal,
    setUnlitMode,
    dispose,
    scene,
    camera,
  };
}
