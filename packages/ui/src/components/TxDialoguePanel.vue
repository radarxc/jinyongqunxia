<script setup lang="ts">
/* global setInterval, clearInterval */
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import type { DialoguePanelView } from '../projections';
import { flowT } from '../i18n-flow';
const props = defineProps<{
  dialogue: DialoguePanelView;
  busy?: boolean;
  reducedMotion?: boolean;
  closable?: boolean;
}>();
const emit = defineEmits<{ choose: [choiceId: string]; continue: []; close: [] }>();
const shown = ref(0);
let timer: ReturnType<typeof setInterval> | undefined;
const revealed = computed(() => shown.value >= props.dialogue.text.length);
const visibleText = computed(() => props.dialogue.text.slice(0, shown.value));
function stop(): void {
  if (timer !== undefined) clearInterval(timer);
  timer = undefined;
}
function begin(): void {
  stop();
  shown.value = props.reducedMotion ? props.dialogue.text.length : 0;
  if (shown.value >= props.dialogue.text.length) return;
  timer = setInterval(() => {
    shown.value = Math.min(props.dialogue.text.length, shown.value + 1);
    if (revealed.value) stop();
  }, 28);
}
function advance(): void {
  if (!revealed.value) {
    shown.value = props.dialogue.text.length;
    stop();
    return;
  }
  if (!props.dialogue.choices.length && props.dialogue.canContinue && !props.busy) emit('continue');
}
watch(() => [props.dialogue.text, props.reducedMotion] as const, begin, { immediate: true });
onBeforeUnmount(stop);
</script>

<template>
  <section
    class="tx-dialogue"
    data-testid="dialogue"
    role="dialog"
    aria-modal="true"
    :aria-label="dialogue.speaker"
  >
    <header>
      <h2 data-testid="dialogue-speaker">{{ dialogue.speaker }}</h2>
      <button v-if="closable" data-testid="dialogue-close" type="button" @click="emit('close')">
        {{ flowT('close') }}
      </button>
    </header>
    <button
      class="tx-dialogue__page"
      data-testid="dialogue-page"
      type="button"
      :disabled="busy"
      @click="advance"
    >
      <span class="tx-dialogue__text" data-testid="dialogue-text" aria-hidden="true">{{ visibleText }}</span>
      <span class="sr-only" data-testid="dialogue-full-text">{{ dialogue.text }}</span>
    </button>
    <ol v-if="dialogue.choices.length && revealed" data-testid="dialogue-choices">
      <li v-for="choice in dialogue.choices" :key="choice.id">
        <button
          data-testid="dialogue-choice"
          type="button"
          :disabled="busy || !!choice.disabledReason"
          :aria-describedby="choice.disabledReason ? `choice-reason-${choice.id}` : undefined"
          @click="emit('choose', choice.id)"
        >
          {{ choice.label }}
        </button>
        <small
          v-if="choice.disabledReason"
          :id="`choice-reason-${choice.id}`"
          data-testid="dialogue-choice-reason"
        >{{ choice.disabledReason }}</small>
      </li>
    </ol>
    <button
      v-else-if="dialogue.canContinue && revealed"
      data-testid="dialogue-continue"
      type="button"
      :disabled="busy"
      @click="emit('continue')"
    >
      {{ flowT('next') }}
    </button>
    <details v-if="dialogue.history.length" data-testid="dialogue-history">
      <summary>{{ flowT('dialogueHistory') }}</summary>
      <p v-for="(line, index) in dialogue.history" :key="index">
        <strong>{{ line.speaker }}</strong>：{{ line.text }}
      </p>
    </details>
  </section>
</template>

<style scoped>
.tx-dialogue {
  display: grid;
  gap: 1rem;
  padding: 1.25rem;
  background: #f4ead3;
  color: #201b17;
}
header {
  display: flex;
  justify-content: space-between;
}
h2 {
  margin: 0;
}
.tx-dialogue__page {
  min-height: 7rem;
  padding: 0.75rem;
  border: 0;
  background: transparent;
  color: inherit;
  text-align: left;
}
.tx-dialogue__text {
  font-size: 1.1em;
  line-height: 1.8;
  white-space: pre-wrap;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}
ol {
  display: grid;
  gap: 0.5rem;
  padding: 0;
  list-style: none;
}
li {
  display: grid;
}
button {
  min-height: 44px;
  font: inherit;
}
</style>
