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
  /** Cutout full-body 立绘; when present it stands on the left with the name beneath it. */
  portrait?: string | null;
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
    :class="{ 'tx-dialogue--figure': !!portrait }"
  >
    <figure v-if="portrait" class="tx-dialogue__figure">
      <img :src="portrait" alt="" draggable="false">
    </figure>
    <div class="tx-dialogue__body">
      <!-- Classical Hexagonal/Octagonal Speaker Plaque (说书人标牌) -->
      <div class="tx-dialogue__speaker-tag">
        <span data-testid="dialogue-speaker" class="tx-dialogue__speaker-title">{{ dialogue.speaker }}</span>
        <button v-if="closable" data-testid="dialogue-close" type="button" class="tx-dialogue__close-btn" @click="emit('close')">
          ✕
        </button>
      </div>

      <button
        class="tx-dialogue__page"
        data-testid="dialogue-page"
        type="button"
        :disabled="busy"
        @click="advance"
      >
        <div class="tx-dialogue__quote-box">
          <span class="quote-mark start">「</span>
          <span class="tx-dialogue__text" data-testid="dialogue-text" aria-hidden="true">{{ visibleText }}</span>
          <span v-if="revealed" class="quote-mark end">」</span>
          <span v-if="!revealed" class="typing-cursor">▌</span>
        </div>
        <span class="sr-only" data-testid="dialogue-full-text">{{ dialogue.text }}</span>
      </button>

      <ol v-if="dialogue.choices.length && revealed" class="tx-dialogue__choices" data-testid="dialogue-choices">
        <li v-for="choice in dialogue.choices" :key="choice.id">
          <button
            class="choice-btn"
            data-testid="dialogue-choice"
            type="button"
            :disabled="busy || !!choice.disabledReason"
            :aria-describedby="choice.disabledReason ? `choice-reason-${choice.id}` : undefined"
            @click="emit('choose', choice.id)"
          >
            <span class="choice-arrow">◆</span>
            <span class="choice-label">{{ choice.label }}</span>
          </button>
          <small
            v-if="choice.disabledReason"
            :id="`choice-reason-${choice.id}`"
            class="choice-disabled-reason"
            data-testid="dialogue-choice-reason"
          >{{ choice.disabledReason }}</small>
        </li>
      </ol>
      <div v-else-if="dialogue.canContinue && revealed" class="tx-dialogue__footer">
        <button
          class="continue-btn"
          data-testid="dialogue-continue"
          type="button"
          :disabled="busy"
          @click="emit('continue')"
        >
          {{ flowT('next') }} ▼
        </button>
      </div>

      <details v-if="dialogue.history.length" class="tx-dialogue__history" data-testid="dialogue-history">
        <summary>{{ flowT('dialogueHistory') }}</summary>
        <div class="history-content">
          <p v-for="(line, index) in dialogue.history" :key="index">
            <strong>{{ line.speaker }}</strong>：{{ line.text }}
          </p>
        </div>
      </details>
    </div>
  </section>
</template>

<style scoped>
.tx-dialogue {
  position: relative;
  display: flex;
  align-items: flex-end;
  gap: 0;
  padding: 0;
  background: transparent;
  color: #ede2cd;
  font-family: var(--font-body, -apple-system, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif);
}

.tx-dialogue--figure {
  display: grid;
  grid-template-columns: clamp(140px, 22vw, 240px) 1fr;
  align-items: flex-end;
}

.tx-dialogue__figure {
  position: relative;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 2;
  pointer-events: none;
}

.tx-dialogue__figure img {
  display: block;
  width: auto;
  max-width: 130%;
  height: clamp(220px, 45vh, 380px);
  margin-bottom: -12px;
  object-fit: contain;
  object-position: bottom center;
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.75)) drop-shadow(0 0 2px rgba(255, 255, 255, 0.15));
  user-select: none;
}

.tx-dialogue__body {
  position: relative;
  flex: 1;
  min-width: 0;
  background: linear-gradient(180deg, rgba(34, 26, 20, 0.94) 0%, rgba(20, 15, 12, 0.96) 100%);
  border: 1px solid rgba(212, 175, 55, 0.45);
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.75), inset 0 1px 0 rgba(255, 235, 190, 0.15);
  border-radius: 6px;
  padding: 1.6rem 1.8rem 1.4rem;
  margin-bottom: 8px;
  backdrop-filter: blur(10px);
  z-index: 1;
}

/* Speaker Octagonal/Hexagonal Plaque (大侠立志传风格姓名牌) */
.tx-dialogue__speaker-tag {
  position: absolute;
  top: -18px;
  left: 28px;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(180deg, #7c4c28 0%, #4a2d16 100%);
  border: 1.5px solid #d4af37;
  padding: 4px 22px;
  border-radius: 3px;
  clip-path: polygon(10px 0%, calc(100% - 10px) 0%, 100% 50%, calc(100% - 10px) 100%, 10px 100%, 0% 50%);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(255, 230, 160, 0.4);
  z-index: 3;
}

.tx-dialogue__speaker-title {
  font-family: var(--font-calligraphy, 'Kaiti SC', KaiTi, serif);
  font-size: 1.15rem;
  font-weight: bold;
  letter-spacing: 3px;
  color: #fff1d0;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.9);
}

.tx-dialogue__close-btn {
  background: transparent;
  border: none;
  color: #dfba82;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0;
  line-height: 1;
}
.tx-dialogue__close-btn:hover {
  color: #fff;
}

.tx-dialogue__page {
  width: 100%;
  min-height: 5.5rem;
  padding: 0.2rem 0;
  border: 0;
  background: transparent;
  color: inherit;
  text-align: left;
  cursor: pointer;
}

.tx-dialogue__quote-box {
  display: inline;
  font-size: 1.12rem;
  line-height: 1.85;
  letter-spacing: 0.5px;
  color: #f3ebd7;
}

.quote-mark {
  color: #d4af37;
  font-weight: bold;
  font-size: 1.25rem;
  margin: 0 4px;
}

.tx-dialogue__text {
  font-size: 1.12rem;
  line-height: 1.85;
  white-space: pre-wrap;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
}

.typing-cursor {
  display: inline-block;
  color: #d4af37;
  margin-left: 2px;
  animation: blink 0.8s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.tx-dialogue__choices {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin: 1rem 0 0;
  padding: 0;
  list-style: none;
}

.choice-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 0.6rem 1.2rem;
  background: linear-gradient(90deg, rgba(60, 45, 35, 0.8) 0%, rgba(45, 32, 24, 0.6) 100%);
  border: 1px solid rgba(212, 175, 55, 0.35);
  border-radius: 4px;
  color: #f7ebd0;
  font-size: 1.02rem;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
}

.choice-btn:hover:not(:disabled) {
  background: linear-gradient(90deg, rgba(120, 80, 45, 0.9) 0%, rgba(85, 55, 30, 0.7) 100%);
  border-color: #d4af37;
  color: #fff;
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

.choice-arrow {
  color: #d4af37;
  font-size: 0.8rem;
}

.choice-disabled-reason {
  color: #a38f78;
  font-size: 0.85rem;
  margin-left: 1.8rem;
  margin-top: 2px;
}

.tx-dialogue__footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 0.5rem;
}

.continue-btn {
  background: transparent;
  border: none;
  color: #d4af37;
  font-size: 0.95rem;
  letter-spacing: 1px;
  cursor: pointer;
  padding: 4px 8px;
  animation: bounce 1.2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(3px); }
}

.tx-dialogue__history {
  margin-top: 0.8rem;
  font-size: 0.85rem;
  color: #a69580;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 0.4rem;
}

.tx-dialogue__history summary {
  cursor: pointer;
  color: #c4a985;
}

.history-content {
  max-height: 120px;
  overflow-y: auto;
  margin-top: 0.4rem;
  padding-right: 6px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}
</style>

