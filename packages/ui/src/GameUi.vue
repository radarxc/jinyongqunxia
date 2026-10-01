<script setup lang="ts">
import { storeToRefs } from 'pinia';
import TxPanel from './components/TxPanel.vue';
import { useUiStore } from './store';

const { projection } = storeToRefs(useUiStore());
</script>

<template>
  <main class="game-ui">
    <header class="title-card">
      <p class="eyebrow">金庸群侠传</p>
      <h1>{{ projection.title }}</h1>
      <p class="subtitle">群书一梦，江湖再启</p>
    </header>
    <TxPanel title="引擎连通">
      <dl>
        <div>
          <dt>Core</dt>
          <dd>v{{ projection.coreVersion }}</dd>
        </div>
        <div>
          <dt>世界刻</dt>
          <dd>{{ projection.worldTick }}</dd>
        </div>
        <div>
          <dt>状态</dt>
          <dd>{{ projection.status }}</dd>
        </div>
      </dl>
    </TxPanel>
  </main>
</template>

<style scoped>
.game-ui {
  position: absolute;
  inset: 0;
  display: grid;
  place-content: center;
  gap: 1.5rem;
  padding: 2rem;
  color: #f5ead0;
  pointer-events: none;
}
.game-ui > * {
  pointer-events: auto;
}
.title-card {
  text-align: center;
  text-shadow: 0 2px 14px #000;
}
.eyebrow {
  margin: 0;
  letter-spacing: 0.55em;
  font-size: 0.72rem;
  opacity: 0.72;
}
h1 {
  margin: 0.2rem 0 0;
  font: 700 clamp(3.2rem, 10vw, 7rem)/1 serif;
  letter-spacing: 0.18em;
}
.subtitle {
  margin: 0.6rem 0 0;
  letter-spacing: 0.28em;
  opacity: 0.8;
}
dl {
  margin: 0;
  display: grid;
  gap: 0.35rem;
  min-width: min(68vw, 22rem);
}
dl div {
  display: flex;
  justify-content: space-between;
  gap: 2rem;
}
dt {
  opacity: 0.68;
}
dd {
  margin: 0;
}
</style>
