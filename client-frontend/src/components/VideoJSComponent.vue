<template>
  <div>{{ title }}</div>
  <video-js id="rushingBVid" />
</template>

<script setup lang="ts">
import { onMounted, ref, toRef, watch } from "vue";
import videojs from "video.js";

const props = defineProps({
  options: Object,
  title: String,
});

const optionPropRef = toRef(props, "options");
onMounted(() => {
  const player = videojs("rushingBVid", optionPropRef.value);
  /*   const getSource = (source) => {
    import(source).then((source) => {
      sourceRef.value = source.default;
    });
  };
  getSource(props.src); */
  player.controlBar.on();
});
</script>

<style scoped></style>
