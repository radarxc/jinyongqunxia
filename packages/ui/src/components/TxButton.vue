<script setup lang="ts">
defineEmits<{ activate: [] }>();
</script>

<template>
  <button class="tx-button" type="button" @click="$emit('activate')">
    <slot />
  </button>
</template>

<style scoped>
.tx-button {
  min-width: 44px;
  min-height: 44px;
  border: 1px solid #c9ad71;
  border-radius: 999px;
  color: #f6ecd3;
  background: #6f2826;
  padding: 0.6rem 1.4rem;
  font: inherit;
  cursor: pointer;
}
.tx-button:hover {
  background: #87332f;
}
.tx-button:focus-visible {
  outline: 3px solid #e4c884;
  outline-offset: 3px;
}
</style>
