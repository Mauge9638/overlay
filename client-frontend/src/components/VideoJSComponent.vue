<template>
  <!-- <div :class="`video-wrapper-for-${title}`"></div> -->
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
  /*   const overlay = document
    .getElementById(titlePropRef.value ? titlePropRef.value : "")
    ?.getElementsByTagName("video")[0];
  document
    .getElementsByClassName(
      `video-wrapper-for-${titlePropRef.value ? titlePropRef.value : ""}`
    )[0]
    .appendChild(overlay);
  console.log(
    document.getElementsByClassName(
      `video-wrapper-for-${titlePropRef.value ? titlePropRef.value : ""}`
    )[0]
  ); */
  player.addClass("vjs-matrix");
  /*   const getSource = (source) => {
    import(source).then((source) => {
      sourceRef.value = source.default;
    });
  };
  getSource(props.src); */
  // player.controlBar.on();
});
</script>

<style scoped>
@import "https://unpkg.com/video.js@7/dist/video-js.min.css";
</style>
