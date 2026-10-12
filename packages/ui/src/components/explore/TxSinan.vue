<script setup lang="ts">
import { computed } from 'vue';
import { sinanSouthAngleRad } from '../../explore/sinan-math';
import { TX_SINAN_STRINGS as strings } from './TxSinan.strings';

const props = withDefaults(defineProps<{ readonly south: readonly [number, number];
  readonly basis: Float32Array | null; readonly northUp: boolean; readonly revision?: number;
  readonly interactive?: boolean }>(), { interactive: true, revision: 0 });
const emit = defineEmits<{ toggle: [] }>();
const spoonTransform = computed(() =>
  `rotate(${(props.revision ?? 0) * 0 + sinanSouthAngleRad(props.south, props.basis, props.northUp)}rad)`);
</script>

<template>
  <button
    type="button" class="sinan" :class="{ static: interactive === false }"
    :title="interactive === false ? strings.paintedLabel : strings.label"
    :aria-label="interactive === false ? strings.paintedLabel : strings.label"
    :aria-pressed="interactive === false ? undefined : northUp"
    @click="interactive !== false && emit('toggle')"
  >
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <defs>
        <linearGradient id="tx-bronze" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="var(--sinan-bronze-light, #d1b26e)" />
          <stop offset=".5" stop-color="var(--sinan-bronze-dark, #8c6b35)" />
          <stop offset="1" stop-color="var(--sinan-bronze-mid, #c29b54)" />
        </linearGradient>
        <radialGradient id="tx-spoon"><stop offset="0" stop-color="var(--sinan-spoon-light, #ead69d)" />
          <stop offset="1" stop-color="var(--sinan-spoon-dark, #705025)" /></radialGradient>
      </defs>
      <path class="earth-plate" d="M7 3h34l4 4v34l-4 4H7l-4-4V7z" fill="url(#tx-bronze)" />
      <g class="ticks"><path
        v-for="n in 24" :key="n" d="M24 5v3"
        :transform="`rotate(${(n - 1) * 15} 24 24)`"
      /></g>
      <circle class="heaven-well" cx="24" cy="24" r="12" />
      <g class="spoon" :style="{ transform: spoonTransform }">
        <ellipse class="spoon-bowl" cx="21" cy="24" rx="7" ry="6" fill="url(#tx-spoon)" />
        <path class="spoon-handle" d="M25 23.2L39 21.5a2 2 0 0 1 0 4L25 24.8z" />
        <ellipse class="spoon-glint" cx="19" cy="22" rx="2.5" ry="1.3" opacity=".65" />
      </g>
      <circle class="patina" cx="10" cy="35" r="1.7" opacity=".75" />
      <circle class="patina" cx="37" cy="13" r="1.2" opacity=".65" />
    </svg>
  </button>
</template>

<style scoped>
.sinan { width: 44px; height: 44px; padding: 0; border: 0; background: transparent; cursor: pointer; }
.sinan.static { cursor: default; }
svg { width: 40px; height: 40px; display: block; filter: drop-shadow(0 2px 2px color-mix(in srgb, var(--ink, #241b12) 40%, transparent)); }
.earth-plate { stroke: var(--sinan-outline, #59431f); }
.heaven-well { fill: var(--sinan-well, #977743); stroke: var(--sinan-outline, #59431f); }
.ticks path { stroke: var(--sinan-tick, #49391f); stroke-width: 1; }
.spoon-bowl, .spoon-handle { stroke: var(--sinan-outline, #59431f); }
.spoon-handle { fill: var(--sinan-spoon-mid, #80602d); }
.spoon-glint { fill: var(--sinan-spoon-glint, #f3e2ad); }
.patina { fill: var(--sinan-patina, #4f806a); }
.spoon { transform-box: view-box; transform-origin: 24px 24px; transition: transform 180ms ease; }
@media (pointer: coarse) { .sinan { width: 60px; height: 60px; } }
@media (prefers-reduced-motion: reduce) { .spoon { transition: none; } }
</style>
