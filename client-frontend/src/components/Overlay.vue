<template>
  <!--  <div :class="`overlay-container invisible`"> -->
  <div :class="`overlay-container`">
    <div>
      <h1 v-if="overlayChosenRef">
        {{ overlays[overlayChosenRef]?.overlayContent[0]?.props.title }}
      </h1>
      <div
        v-for="option in overlays[overlayChosenRef]?.overlayContent[0]?.props
          ?.options"
      >
        <input
          v-model="overlayAnswerRef"
          :id="option.value"
          type="radio"
          :value="option.value"
        />
        <label :for="option.value">{{ option.label }}</label
        ><br />
      </div>
    </div>
    <button @click="sendAnswer">Send svar</button>
  </div>
  <!--  <div v-else-if="!overlayChosen" class="invisible"></div> -->
</template>

<script setup lang="ts">
import { onMounted, ref, toRef, watch } from "vue";
const props = defineProps({
  options: Object,
  title: String,
  desiredOverlayId: String,
});
const optionPropRef = toRef(props, "options");
const titlePropRef = toRef(props, "title");
const desiredOverlayIdPropRef = toRef(props, "desiredOverlayId");

/* const overlays = {
  a71yP3dJbmaFfsMra7TR: {
    question: "What do u think?",
    options: [
      { label: "yes", value: "yes" },
      { label: "no", value: "no" },
      { label: "mby", value: "mby" },
      { label: "idk", value: "idk" },
    ],
  },
  YwfJuyDsRtpQQxduab8c: {
    question: "Favourite animal",
    options: [
      { label: "dog", value: "dog" },
      { label: "cat", value: "cat" },
      { label: "cow", value: "cow" },
      { label: "rabbit", value: "rabbit" },
    ],
  },
  EFryiW2ZMUxb_InlnkrP: {
    question: "Favourite color?",
    options: [
      { label: "black", value: "black" },
      { label: "red", value: "red" },
      { label: "blue", value: "blue" },
      { label: "white", value: "white" },
    ],
  },
  owGrQoXqtS2JKVoA1eMK: {
    question: "Least liked fruit?",
    options: [
      { label: "apple", value: "apple" },
      { label: "pear", value: "pear" },
      { label: "orange", value: "orange" },
      { label: "banana", value: "banana" },
      { label: "strawberry", value: "strawberry" },
      { label: "durian", value: "durian" },
    ],
  },
}; */

const overlayChosenRef = ref("");
const overlays = ref({});

let webSocketConnection: WebSocket;

const overlayAnswerRef = ref("");

watch(overlayChosenRef, () => {
  document
    .getElementsByClassName(`overlay-container`)[0]
    .classList.remove("invisible");
});
const sendAnswer = () => {
  overlayChosenRef.value = "5aj0s05sjj05aj0sa95";
};
/* const sendAnswer = () => {
  console.log(overlayAnswerRef.value);
  document
    .getElementsByClassName(`overlay-container`)[0]
    .classList.add("invisible");
  overlayAnswerRef.value = "";
}; */

webSocketConnection = new WebSocket(
  "wss://sonim20w02.execute-api.eu-central-1.amazonaws.com/v1"
);
// webSocketConnection = new WebSocket(
//   "wss://virkerikkelooller.execute-api.eu-central-1.amazonaws.com/v1"
// );

const getCookie = (cookieName: string): string => {
  const name = cookieName + "=";
  const cookies = document.cookie.split(";");
  for (let i = 0; i < cookies.length; i++) {
    let currentCookie = cookies[i];
    while (currentCookie.charAt(0) == " ") {
      currentCookie = currentCookie.substring(1);
    }
    if (currentCookie.indexOf(name) == 0) {
      return currentCookie.substring(name.length, currentCookie.length);
    }
  }
  return "";
};

const setCookie = async (
  cookieName: string,
  cookieValue: string,
  existDays: number
) => {
  const expiryDate = new Date();
  expiryDate.setTime(expiryDate.getTime() + existDays * 24 * 60 * 60 * 1000);
  let expires = "expires=" + expiryDate.toUTCString();
  document.cookie = cookieName + "=" + cookieValue + ";" + expires + ";path=/";
};

const checkOverlayCookieIdValidity = async () => {
  console.log("Getting cookie with the name: overlayIdCookieKey");
  const overlayIdCookieKey = getCookie("overlayIdCookieKey");
  console.log("overlayIdCookieKey:", overlayIdCookieKey);
  console.log("Checking for validity");
  webSocketConnection.send(
    `{ "action": "checkOverlayCookieId", "overlayIdCookieKey": "${overlayIdCookieKey}"}`
  );
};

const onMessageCheckOverlayCookieIdHandler = async (parsedData: Object) => {
  return new Promise((resolve, reject) => {
    try {
      console.log(parsedData);
      if (parsedData?.content) {
        const newOverlayIdCookieKey =
          parsedData?.content?.newOverlayIdCookieKey;
        setCookie("overlayIdCookieKey", newOverlayIdCookieKey, 365);
        resolve(`Cookie set to: ${newOverlayIdCookieKey}`);
      } else if (parsedData?.message) {
        resolve(parsedData.message);
      }
    } catch (err) {
      reject(err);
    }
  });
};

webSocketConnection.onopen = async (event) => {
  console.log("onopen");
  console.log(event);
  checkOverlayCookieIdValidity();
};
webSocketConnection.onerror = (event) => {
  console.log("onerror");
  console.log(event);
};
webSocketConnection.onmessage = async (event) => {
  console.log("onmessage");
  console.log(event);
  console.log(event.data);
  const parsedData = JSON.parse(event.data);
  if (parsedData?.subject == "checkOverlayCookieId") {
    try {
      return onMessageCheckOverlayCookieIdHandler(parsedData)
        .then((data) => {
          return Promise.resolve(data);
        })
        .then((data) => {
          console.log(data);
          if (desiredOverlayIdPropRef.value != "") {
            webSocketConnection.send(
              `{ "action": "getOverlayContent", "desiredOverlayId": "${desiredOverlayIdPropRef.value}"}`
            );
          }
        });
    } catch (err) {
      console.log(err);
    }
  } else if (
    parsedData?.subject == "getOverlayContent" &&
    parsedData?.content
  ) {
    const overlayContent = parsedData?.content?.overlayContent;
    overlays.value = {
      [overlayContent?.Item?.id]: {
        broadcastTitle: overlayContent.Item.broadcastTitle,
        overlayContent: overlayContent.Item.overlayContent,
      },
    };
    console.log(overlays.value);
  }
};

onMounted(() => {
  /*   const list = document.getElementsByTagName("input")[0];
  list.style.background = optionPropRef.value?.css_styling.background; */
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
.overlay-container {
  padding: 2px;
  border: 4px solid rgb(138, 148, 194, 1);
  background: rgba(22, 44, 6, 1);
  height: fit-content;
  pointer-events: all;
  text-align: left;
}
.overlay-container label {
  @apply text-base;
}
.overlay-container button {
  @apply bg-slate-400 rounded-full border-2 border-solid border-indigo-700 text-base text-black hover:text-white hover:bg-slate-800;
}
</style>
