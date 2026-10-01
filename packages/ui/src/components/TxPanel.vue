<script setup lang="ts">
defineProps<{ title?: string }>();
</script>

<template>
  <section class="tx-panel">
    <h2 v-if="title" class="tx-panel__title">
      {{ title }}
    </h2>
    <slot />
  </section>
</template>

<style scoped>
.tx-panel {
  border: 1px solid rgb(222 205 166 / 55%);
  border-radius: 12px;
  background: rgb(25 21 19 / 72%);
  box-shadow: inset 0 0 28px rgb(0 0 0 / 22%);
  padding: 1rem 1.25rem;
}
.tx-panel__title {
  margin: 0 0 0.75rem;
  font-size: 1rem;
  letter-spacing: 0.18em;
}
</style>
