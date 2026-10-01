<script setup lang="ts">
import { t } from '@tianshu/ui/runtime';
defineProps<{ scene: 'world' | 'town' | 'battle' }>();
</script>

<template>
  <section class="scene-placeholder" :aria-label="t(scene)">
    <div class="ink-mountains" aria-hidden="true"><i /><i /><i /></div>
    <div class="scene-copy"><p>{{ t('eyebrow') }}</p><h1>{{ t(scene) }}</h1><p>{{ t('sceneNote') }}</p></div>
  </section>
</template>

<style scoped>
.scene-placeholder { position: relative; height: 100%; min-height: 260px; display: grid; place-items: center; overflow: hidden; isolation: isolate; }
.scene-copy { max-width: 560px; text-align: center; z-index: 1; padding: 28px; background: #efe6d2b8; }
.scene-copy h1 { font: 48px var(--font-title); letter-spacing: .15em; margin: 20px 0; }
.scene-copy > p:first-child { letter-spacing: .3em; }
.ink-mountains { position: absolute; inset: 0; overflow: hidden; opacity: .16; }
.ink-mountains i { position: absolute; width: 60%; height: 60%; background: var(--ink); clip-path: polygon(0 100%, 17% 50%, 32% 73%, 51% 12%, 74% 68%, 86% 30%, 100% 100%); left: -8%; bottom: 0; }
.ink-mountains i:nth-child(2) { left: 28%; bottom: -10%; transform: scaleX(-1); opacity: .7; }
.ink-mountains i:nth-child(3) { left: 60%; height: 85%; opacity: .35; }
</style>
