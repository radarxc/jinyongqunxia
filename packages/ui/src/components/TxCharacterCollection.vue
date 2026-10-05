<script setup lang="ts">
import { computed, ref } from 'vue';
import type { CharacterView } from '../projections';
import { gradeLabel, t } from '../i18n';
import TxAsset from './TxAsset.vue';
import TxMeridianMap from './TxMeridianMap.vue';
import TxVirtualList from './TxVirtualList.vue';
const props = defineProps<{ characters: readonly CharacterView[] }>();
const search = ref('');
const filter = ref<'all' | 'met' | 'befriended'>('all');
const selectedKey = ref('');
const selected = computed(() => props.characters.find((entry) => entry.key === selectedKey.value) ?? props.characters[0]);
const filtered = computed(() => props.characters.filter((entry) =>
  (filter.value === 'all' || (filter.value === 'met' ? entry.relation !== 'unseen' : entry.relation === 'befriended')) &&
  entry.name.includes(search.value.trim())));
const counts = computed(() => ({
  met: props.characters.filter((entry) => entry.relation === 'met' || entry.relation === 'befriended').length,
  friends: props.characters.filter((entry) => entry.relation === 'befriended').length,
}));
function relationLabel(relation: CharacterView['relation']): string {
  return relation === 'self' ? t('self') : relation === 'met' ? t('stateMet') : relation === 'befriended' ? t('stateBefriended') : t('unseen');
}
</script>

<template>
  <section class="character-page" :aria-label="t('characters')">
    <div class="collection">
      <div class="collection-summary"><strong>{{ t('encounters') }} {{ counts.met }}</strong><span>{{ t('befriended') }} {{ counts.friends }}</span></div>
      <label><span class="sr-only">{{ t('searchCharacters') }}</span><input v-model="search" type="search" :placeholder="t('searchCharacters')"></label>
      <nav class="action-row" :aria-label="t('relationship')">
        <button type="button" :aria-pressed="filter === 'all'" @click="filter = 'all'">{{ t('all') }}</button>
        <button type="button" :aria-pressed="filter === 'met'" @click="filter = 'met'">{{ t('stateMet') }}</button>
        <button type="button" :aria-pressed="filter === 'befriended'" @click="filter = 'befriended'">{{ t('stateBefriended') }}</button>
      </nav>
      <TxVirtualList :key="`${filter}/${search}`" :items="filtered" :item-key="entry => entry.key" :label="t('characters')" :row-height="168" :min-width="270" :height="520">
        <template #default="{ item }">
          <button type="button" class="character-card" :aria-pressed="selected?.key === item.key" @click="selectedKey = item.key">
            <TxAsset :src="item.portrait" :label="item.name" portrait :hidden="item.relation === 'unseen'" />
            <span class="character-info"><strong>{{ item.name }}</strong><small>{{ item.faction }}</small><small>{{ relationLabel(item.relation) }}<template v-if="item.affinity !== null"> · {{ item.affinity }}</template></small></span>
          </button>
        </template>
      </TxVirtualList>
    </div>
    <article v-if="selected" :key="selected.key" class="character-detail paper-panel">
      <header class="character-heading"><TxAsset :src="selected.portrait" :label="selected.name" portrait :hidden="selected.relation === 'unseen'" /><div><h2>{{ selected.name }}</h2><p>{{ selected.faction }} · {{ relationLabel(selected.relation) }}</p></div></header>
      <p>{{ selected.biography }}</p>
      <p v-if="selected.affinity !== null">{{ t('affinity') }}：{{ selected.affinity }}</p>
      <template v-if="selected.detail">
        <h3>{{ t('stats') }}</h3>
        <dl class="stat-grid"><div v-for="stat in selected.detail.stats" :key="stat.key"><dt>{{ stat.label }}</dt><dd>{{ stat.value }}</dd></div></dl>
        <h3>{{ t('skills') }}</h3>
        <ul class="skill-list"><li v-for="skill in selected.detail.skills" :key="skill.id"><strong>{{ skill.name }}</strong><span>{{ gradeLabel(skill.grade) }} · {{ skill.layer }} {{ t('layer') }}</span></li></ul>
        <p v-if="!selected.detail.skills.length">{{ t('noSkills') }}</p>
        <p>{{ t('meridianSummary') }}：{{ selected.detail.opened }} / {{ selected.detail.completed }}</p>
        <TxMeridianMap :meridians="selected.detail.meridians" />
      </template>
      <p v-else>{{ selected.relation === 'unseen' ? t('unknownCharacter') : t('detailsUnknown') }}</p>
    </article>
    <p v-else>{{ t('selectCharacter') }}</p>
  </section>
</template>

<style scoped>
.character-page { display: grid; grid-template-columns: minmax(300px, 1.2fr) minmax(320px, 1fr); gap: 24px; min-height: 0; }
.collection { min-width: 0; }
.collection-summary { display: flex; gap: 24px; padding: 0 0 16px; }
.character-card { display: flex; width: 100%; height: 100%; gap: 16px; align-items: center; padding: 14px; text-align: left; }
.character-info { display: grid; gap: 10px; }
.character-info strong { font: 24px var(--font-title); }
.character-detail { overflow: auto; padding: 24px; }
.character-heading { display: flex; align-items: center; gap: 22px; }
.character-heading h2 { margin-top: 0; }
.stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px 24px; }
.stat-grid div, .skill-list li { display: flex; justify-content: space-between; gap: 16px; }
.stat-grid dd { margin: 0; font-weight: 700; }
.skill-list { list-style: none; padding: 0; }
@media (max-width: 780px) { .character-page { grid-template-columns: 1fr; } .character-detail { overflow: visible; } }
</style>
