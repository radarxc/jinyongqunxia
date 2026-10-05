<script setup lang="ts">
import { t } from '@tianshu/ui/runtime';
const props = defineProps<{ scene: 'world' | 'town' | 'ruin' | 'battle' }>();
const emit = defineEmits<{ leave: [] }>();
function sceneName(): string {
  if (props.scene === 'ruin') return '野外遗迹';
  return t(props.scene);
}
</script>

<template>
  <section class="scene-placeholder" :aria-label="sceneName()">
    <div class="ink-mountains" aria-hidden="true"><i /><i /><i /></div>
    <div class="scene-copy">
      <p>{{ t('eyebrow') }}</p><h1>{{ sceneName() }}</h1><p>{{ t('sceneNote') }}</p>
      <button v-if="scene === 'town' || scene === 'ruin'" type="button" @click="emit('leave')">返回大地图</button>
    </div>
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
