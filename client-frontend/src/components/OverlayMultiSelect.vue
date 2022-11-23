<template>
  <div class="container_div">
    <div class="container_title">
      {{ propsPropRef?.title }}
    </div>
    <div
      class="input_div"
      v-for="option in propsPropRef?.options"
      :key="option.value"
    >
      <input
        v-model="overlayAnswerRef"
        :id="option.value"
        type="checkbox"
        :value="option.value"
      />
      <label :for="option.value">{{ option.label }}</label
      ><br />
    </div>
    <button class="send_answer_btn" @click="sendAnswer">Submit answer</button>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, toRef, watch } from "vue";
const props = defineProps({
  props: { type: Object, required: true },
});

const emit = defineEmits(["sendAnswerToOverlayContent"]);

const propsPropRef = toRef(props, "props");

const overlayAnswerRef = ref([]);

const sendAnswer = () => {
  emit("sendAnswerToOverlayContent", overlayAnswerRef.value);
};
</script>

<style>
.container_div:has(.input_div:hover) > .input_div:not(:hover) {
  @apply opacity-40;
}

.input_div:hover {
  @apply underline;
}

.input_div label {
  @apply ml-1;
}

.container_div {
  @apply text-base;
}

.send_answer_btn {
  @apply !border-2 !border-solid !border-red-800 !rounded-md !pr-2 !pl-2 !bg-transparent;
}

.send_answer_btn:hover {
  @apply animate-pulse shadow-lg shadow-inner;
}

.send_answer_btn:focus {
  @apply animate-ping;
}

.container_title {
  @apply bg-red-800 rounded-md pl-2 font-bold;
}
</style>
