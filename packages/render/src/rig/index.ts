export { RigBatch, type RigBatchCharacter, type RigBatchStats } from './batch';
export {
  CLIP_BONES, CLIP_JOINTS, RigClipError, RigClipErrorCode, clearRigClipRegistry, getRigClip,
  loadRigClip, registerRigClip, requireRigClip, type RigClip, type RigClipEvent,
} from './clip';
export { CLIP_CROSSFADE_SECONDS, CLIP_SAMPLE_FPS, createClipPlayer, type ClipPlayer, type ClipPlayerOptions } from './clip-player';
export { loadRigClipMap, resolveRigClipKey, type RigClipMap, type RigClipMapEntry } from './clip-map';
export type { RigSnapshot } from './character';
export { createRigCharacter, zOrderForPart, type RigInstance } from './character';
export { assembleEquipment, equipmentEquals, weightClassForEquipment, type EquipmentAssembly } from './equipment';
export {
  createGaitPose, gaitPeriod, motionModeForSpeed, quantizePoseTime, resolveDirection,
  sampleGait, sampleGaitInto, sampleIdle, sampleIdleInto, stableIdlePhase, weightTuning,
  type DirectionView, type GaitPose,
} from './gait';
export { createRigInstanceBuffer, type DirtyRange, type RigInstanceBuffer, type RigInstanceData } from './instance-buffer';
export { loadRigSet, validateRigManifest, type RigManifestInput } from './manifest';
export { createPlaceholderRigManifest } from './placeholder';
export { createClipProjection, createPartPoseBuffer, projectClipFrame, resetClipProjection, roundHalfAway, type ClipProjection } from './project';
export { RIG_NEAR_SIDE } from './types';
export { createRigDemoScene, type RigDemoController, type RigDemoEquipmentSlot, type RigDemoEventListener, type RigDemoStats } from './scene';
export type {
  AtlasCell, ClipPlayOptions, Dir8, EquipmentAsset, EquipmentRef, EquipmentVisuals, MotionMode, PartPose, PartPoseBuffer, RigBoneLengthKey, RigClipEventType,
  RigManifest, RigManifestPart, RigPart, RigSet, RigSide, RigSourcePart, RigView, TintSlot, WeightClass,
} from './types';
