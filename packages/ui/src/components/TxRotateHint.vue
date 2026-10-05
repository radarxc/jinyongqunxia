<script setup lang="ts">
import { flowT } from '../i18n-flow';
defineProps<{ visible: boolean }>();
defineEmits<{ dismiss: [] }>();
</script>
<template>
  <aside v-if="visible" class="tx-rotate" role="dialog" aria-modal="true" aria-labelledby="rotate-title">
    <div aria-hidden="true">↻</div><h2 id="rotate-title">{{ flowT('rotateTitle') }}</h2>
    <p>{{ flowT('rotateBody') }}</p><button type="button" @click="$emit('dismiss')">{{ flowT('rotateDismiss') }}</button>
  </aside>
</template>
<style scoped>
.tx-rotate { position: fixed; inset: 0; z-index: 100; display: grid; place-content: center; justify-items: center; gap: 1rem; padding: 2rem; text-align: center; color: #f5ead1; background: rgb(20 17 15 / 96%); }
.tx-rotate div { font-size: 4rem; } button { min-height: 48px; padding: .5rem 1.5rem; font: inherit; }
</style>
