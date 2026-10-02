export { RigBatch, type RigBatchCharacter, type RigBatchStats } from './batch';
export type { RigSnapshot } from './character';
export { createRigCharacter, type RigInstance } from './character';
export { assembleEquipment, equipmentEquals, weightClassForEquipment, type EquipmentAssembly } from './equipment';
export {
  createGaitPose, gaitPeriod, motionModeForSpeed, quantizePoseTime, resolveDirection,
  sampleGait, sampleGaitInto, sampleIdle, sampleIdleInto, stableIdlePhase, weightTuning,
  type DirectionView, type GaitPose,
} from './gait';
export { createRigInstanceBuffer, type DirtyRange, type RigInstanceBuffer, type RigInstanceData } from './instance-buffer';
export { loadRigSet, validateRigManifest, type RigManifestInput } from './manifest';
export { createPlaceholderRigManifest } from './placeholder';
export { createRigDemoScene, type RigDemoController, type RigDemoEquipmentSlot, type RigDemoStats } from './scene';
export type {
  AtlasCell, Dir8, EquipmentAsset, EquipmentRef, EquipmentVisuals, MotionMode,
  RigManifest, RigManifestPart, RigPart, RigSet, RigSourcePart, RigView, TintSlot, WeightClass,
} from './types';
