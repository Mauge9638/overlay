<template>
  <div>{{ title }}</div>
  <div class="video-wrapper"></div>
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

  const overlay = document.getElementsByTagName("video")[0];
  document.getElementsByClassName("video-wrapper")[0].appendChild(overlay);
  /*   const getSource = (source) => {
    import(source).then((source) => {
      sourceRef.value = source.default;
    });
  };
  getSource(props.src); */
  // player.controlBar.on();
});
</script>

<style scoped></style>
