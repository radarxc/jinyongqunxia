<script setup lang="ts">
import { computed, ref } from 'vue';
import type { MeridianView } from '../projections';
import { gradeLabel, t } from '../i18n';
const props = defineProps<{ meridians: readonly MeridianView[] }>();
const selected = ref('');
const current = computed(() => props.meridians.find((entry) => entry.id === selected.value) ?? props.meridians[0]);
</script>

<template>
  <section class="meridian-map" :aria-label="t('meridians')">
    <h3>{{ t('meridians') }}</h3>
    <label class="sr-only" for="meridian-select">{{ t('meridianChoose') }}</label>
    <select id="meridian-select" v-model="selected">
      <option disabled value="">{{ t('meridianChoose') }}</option>
      <option v-for="meridian in meridians" :key="meridian.id" :value="meridian.id">{{ meridian.name }} · {{ meridian.completed ? t('opened') : t('locked') }}</option>
    </select>
    <template v-if="current">
      <p>{{ current.name }} · {{ gradeLabel(current.grade) }} · {{ t('strength') }} {{ current.strength ?? '—' }} · {{ t('flux') }} {{ current.flux ?? '—' }}</p>
      <ol class="meridian-points">
        <li v-for="point in current.points" :key="point.id" :class="{ opened: point.opened }">
          <span class="point-dot" aria-hidden="true">{{ point.opened ? '●' : '○' }}</span>
          <div><strong>{{ point.name }}</strong><small>{{ point.opened ? t('opened') : t('locked') }} · {{ gradeLabel(point.grade) }}</small></div>
          <div class="point-values"><span>{{ t('strength') }} {{ point.strength ?? '—' }}</span><small>{{ t('flux') }} {{ point.flux ?? '—' }}</small></div>
        </li>
      </ol>
    </template>
    <p v-else>{{ t('noMeridians') }}</p>
  </section>
</template>

<style scoped>
.meridian-map select { width: 100%; }
.meridian-points { list-style: none; margin: 18px 0; padding: 0; }
.meridian-points li { display: flex; align-items: center; gap: 14px; min-height: 70px; position: relative; }
.meridian-points li:not(:last-child)::after { content: ''; position: absolute; left: 9px; top: 45px; bottom: -20px; width: 2px; background: var(--line); }
.meridian-points li.opened::after { background: var(--blue); }
.point-dot { color: var(--ink-medium); z-index: 1; width: 20px; }
.opened .point-dot { color: var(--blue); }
.meridian-points li > div { display: grid; gap: 3px; }
.point-values { margin-left: auto; text-align: right; }
</style>
