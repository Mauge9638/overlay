<template>
  <div @click="test">
    <ul class="text-3xl font-bold underline">
      <li>Hej</li>
      <li>Hej</li>
      <li>Hej</li>
      <li>Hej</li>
      <li>Hej</li>
      <li>Hej</li>
      <li>Hej</li>
      <li>Hej</li>
      <li>Hej</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, toRef, watch } from "vue";
const props = defineProps({
  options: Object,
  title: String,
});
const optionPropRef = toRef(props, "options");
const test = () => {
  console.log("test");
};

const array = [22, 44, 6, 1];

onMounted(() => {
  const list = document.getElementsByTagName("ul")[0];
  list.style.background = optionPropRef.value?.css_styling.background;
  setTimeout(() => {
    const overlay = document.getElementsByClassName("overlay")[0];
    document
      .getElementsByClassName("videoJsPlayer")[0]
      .getElementsByTagName("video-js")[0]
      .appendChild(overlay);
    const overlay2 = document.getElementsByClassName("overlay2")[0];
    document
      .getElementsByClassName("videoJsPlayer2")[0]
      .getElementsByTagName("video-js")[0]
      .appendChild(overlay2);
  }, 400);
});
</script>

<style scoped>
div {
  padding: 2px;
  border: 4px solid rgb(138, 148, 194, 1);
  background: rgba(22, 44, 6, 0);
  height: fit-content;
  pointer-events: all;
  text-align: left;
}
</style>
