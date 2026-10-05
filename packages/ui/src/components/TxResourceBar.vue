<script setup lang="ts">
import { computed } from 'vue';
import type { ResourceView } from '../projections';
const props = defineProps<{ label: string; resource: ResourceView; tone: 'hp' | 'mp' | 'action' }>();
const ratio = computed(() => props.resource.maximum > 0 ? Math.max(0, Math.min(1, props.resource.current / props.resource.maximum)) : 0);
</script>
<template>
  <div class="resource" :class="tone" role="meter" :aria-label="label" :aria-valuenow="resource.current" :aria-valuemin="0" :aria-valuemax="resource.maximum || 1">
    <div class="resource-label"><span>{{ label }}</span><strong>{{ resource.current }} / {{ resource.maximum }}</strong></div>
    <div class="resource-track"><span :style="{ transform: `scaleX(${ratio})` }" /></div>
  </div>
</template>
<style scoped>
.resource-label { display: flex; justify-content: space-between; gap: 12px; font-size: 16px; }
.resource-track { height: 7px; background: var(--line); margin-top: 5px; }
.resource-track span { display: block; height: 100%; transform-origin: left; background: var(--vermilion); transition: transform .15s ease; }
.mp .resource-track span { background: var(--blue); }
.action .resource-track span { background: var(--green); }
</style>
