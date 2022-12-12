<template>
  <video-js :id="title" />
</template>

<script setup lang="ts">
import { onMounted, ref, toRef, watch } from "vue";
import videojs from "video.js";

const props = defineProps({
  options: Object,
  title: String,
});

const optionPropRef = toRef(props, "options");
const titlePropRef = toRef(props, "title");
onMounted(() => {
  const player = videojs(`${titlePropRef.value}`, optionPropRef.value);
  player.addClass("vjs-matrix");
});
</script>

<style scoped>
@import "https://unpkg.com/video.js@7/dist/video-js.min.css";
</style>
