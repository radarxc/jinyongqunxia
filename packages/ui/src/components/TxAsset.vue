<script setup lang="ts">
import { ref, watch } from 'vue';
const props = defineProps<{ src: string | null; label: string; portrait?: boolean; hidden?: boolean }>();
const failed = ref(false);
watch(() => props.src, () => { failed.value = false; });
</script>

<template>
  <span class="asset" :class="{ portrait, silhouette: hidden }">
    <img v-if="src && !failed && !hidden" :src="src" :alt="label" loading="lazy" decoding="async" @error="failed = true">
    <svg v-else-if="portrait" viewBox="0 0 96 112" role="img" :aria-label="label">
      <circle cx="48" cy="30" r="15" />
      <path d="M23 104 27 66Q30 48 48 48Q66 48 69 66L75 104Z" />
      <path d="M42 12 40 5H54L56 12" />
    </svg>
    <span v-else class="asset-glyph" role="img" :aria-label="label">{{ label.slice(0, 1) }}</span>
  </span>
</template>

<style scoped>
.asset { display: grid; place-items: center; background: var(--paper-silk); border: 1px solid var(--line); flex-shrink: 0; width: 64px; height: 64px; overflow: hidden; }
.asset img { width: 100%; height: 100%; object-fit: contain; }
.portrait { width: 88px; height: 112px; background: linear-gradient(150deg, var(--paper), var(--paper-silk)); }
.portrait svg { width: 100%; height: 100%; fill: var(--ink-medium); opacity: .65; }
.silhouette svg { fill: var(--ink); opacity: .85; }
.asset-glyph { font: 28px var(--font-title); color: var(--ink-medium); }
</style>
