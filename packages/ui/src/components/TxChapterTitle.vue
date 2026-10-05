<script setup lang="ts">
import { flowM1T } from '../i18n-flow';
defineProps<{ year: number; location: string }>();
defineEmits<{ continue: [] }>();
function eraYear(year: number): string { return year === 702 ? '长安二年' : `${year} 年`; }
</script>

<template>
  <section class="tx-chapter-title paper-panel" data-testid="baima-title-card" aria-labelledby="chapter-title-heading">
    <p data-testid="baima-dateloc">{{ eraYear(year) }}（{{ year }}）·{{ location }}</p><h1 id="chapter-title-heading">{{ flowM1T('baimaVolume') }}</h1><button data-testid="baima-continue" type="button" @click="$emit('continue')">{{ flowM1T('enterBaima') }}</button>
  </section>
</template>

<style scoped>
.tx-chapter-title { display: grid; place-items: center; align-content: center; min-height: 24rem; padding: 2rem; text-align: center; }
h1 { font-size: clamp(2rem, 6vw, 4rem); } p { letter-spacing: .15em; } button { min-height: 44px; font: inherit; }
</style>
