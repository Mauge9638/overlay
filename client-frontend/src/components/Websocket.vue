<template>
  <div class="container">
    connection is: {{ connectionStatus }}
    <div class="websocket_output">
      <div class="input_field">
        <p>Enter message for websocket</p>
        <input
          type="text"
          v-model="outputMessage"
          placeholder="Enter message here"
        />
      </div>
      <button @click="sendMessage">Send message to websocket</button>
    </div>
    <div class="divider"></div>
    <div class="websocket_input">
      <div class="input_field">
        <p>Message from websocket</p>
        <textarea
          type="text"
          v-model="inputMessage"
          placeholder="Received message will appear here"
        ></textarea>
      </div>
      <select
        v-model="overlaySelectorRef"
        name="overlaySelector"
        id="overlaySelector"
      >
        <option value="a71yP3dJbmaFfsMra7TR">1</option>
        <option value="YwfJuyDsRtpQQxduab8c">2</option>
        <option value="EFryiW2ZMUxb_InlnkrP">3</option>
        <option value="owGrQoXqtS2JKVoA1eMK">4</option>
      </select>
    </div>
    <div class="videoPlayers">
      <Overlay
        class="overlay"
        :options="overlayOptions"
        desired-overlay-id="as5pionaspo5napsot"
      />
      <Overlay
        class="overlay2"
        :options="overlayOptions"
        desired-overlay-id=""
      />
      <div class="videoJsPlayer">
        <VideoJSComponent
          :options="videoJsOptions"
          title="VideoJsPlayer"
        ></VideoJSComponent>
      </div>
      <div class="videoJsPlayer2">
        <VideoJSComponent
          :options="videoJsOptions2"
          title="VideoJsPlayer2"
        ></VideoJSComponent>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import Overlay from "./Overlay.vue";
import VideoJSComponent from "./VideoJSComponent.vue";
import ironGrip from "../assets/videos/irongrip.mp4";
import rushingB from "../assets/videos/rushingb.mp4";

const overlayOptions = { css_styling: { background: "blue" } };

const videoJsOptions = {
  autoplay: "any",
  preload: "auto",
  controls: true,
  fluid: true,
  sources: { src: ironGrip, type: "video/mp4" },
};
const videoJsOptions2 = {
  autoplay: "any",
  preload: "auto",
  controls: true,
  fluid: true,
  controlBar: {
    playToggle: {
      replay: true,
    },
  },
  sources: { src: rushingB, type: "video/mp4" },
};

const inputMessage = ref("");
const outputMessage = ref("");
const connectionStatus = ref();
const overlaySelectorRef = ref(0);
const connectionIsOpen = ref(false);

let webSocketConnection: WebSocket;

onMounted(() => {
  /*   const overlay = document.getElementsByClassName("overlay")[0];
  document
    .getElementsByClassName("videoJsPlayer")[0]
    .getElementsByTagName("video-js")[0]
    .appendChild(overlay);
  const overlay2 = document.getElementsByClassName("overlay2")[0];
  document
    .getElementsByClassName("videoJsPlayer2")[0]
    .getElementsByTagName("video-js")[0]
    .appendChild(overlay2); */
});

// webSocketConnection = new WebSocket(
//   "wss://sonim20w02.execute-api.eu-central-1.amazonaws.com/v1"
// );
// // webSocketConnection = new WebSocket(
// //   "wss://virkerikkelooller.execute-api.eu-central-1.amazonaws.com/v1"
// // );

// const getCookie = (cookieName: string): string => {
//   const name = cookieName + "=";
//   const cookies = document.cookie.split(";");
//   for (let i = 0; i < cookies.length; i++) {
//     let currentCookie = cookies[i];
//     while (currentCookie.charAt(0) == " ") {
//       currentCookie = currentCookie.substring(1);
//     }
//     if (currentCookie.indexOf(name) == 0) {
//       return currentCookie.substring(name.length, currentCookie.length);
//     }
//   }
//   return "";
// };

// const setCookie = (
//   cookieName: string,
//   cookieValue: string,
//   existDays: number
// ) => {
//   const expiryDate = new Date();
//   expiryDate.setTime(expiryDate.getTime() + existDays * 24 * 60 * 60 * 1000);
//   let expires = "expires=" + expiryDate.toUTCString();
//   document.cookie = cookieName + "=" + cookieValue + ";" + expires + ";path=/";
// };

// const checkOverlayCookieIdValidity = () => {
//   console.log("Getting cookie with the name: overlayIdCookieKey");
//   const overlayIdCookieKey = getCookie("overlayIdCookieKey");
//   console.log("overlayIdCookieKey:", overlayIdCookieKey);
//   console.log("Checking for validity");
//   webSocketConnection.send(
//     `{ "action": "checkOverlayCookieId", "overlayIdCookieKey": "${overlayIdCookieKey}"}`
//   );
// };

// webSocketConnection.onopen = async (event) => {
//   console.log("onopen");
//   console.log(event);
//   connectionStatus.value = event.type;
//   connectionIsOpen.value = true;
//   checkOverlayCookieIdValidity();
// };
// webSocketConnection.onerror = (event) => {
//   console.log("onerror");
//   console.log(event);
//   connectionStatus.value = event.type;
//   connectionIsOpen.value = true;
// };
// webSocketConnection.onmessage = (event) => {
//   console.log("onmessage");
//   console.log(event);
//   console.log(event.data);
//   if (JSON.parse(event.data)?.newOverlayIdCookieKey) {
//     const newOverlayIdCookieKey = JSON.parse(event.data)?.newOverlayIdCookieKey;
//     setCookie("overlayIdCookieKey", newOverlayIdCookieKey, 365);
//   }
//   inputMessage.value = JSON.parse(event.data).message;
// };

// const sendMessage = async () => {
//   console.log(outputMessage.value);
//   //checkOverlayCookieIdValidity();
//   webSocketConnection.send(
//     `{ "action": "test", "name": "${outputMessage.value}"}`
//   );
// };
</script>

<style>
.container {
  position: absolute;
  top: 10px;
  left: 10px;
  display: grid;
  grid-template-columns: 24vw 24vw 24vw 24vw;
  grid-template-rows: auto;
  grid-template-areas:
    "websocketOutput websocketInput websocketInput websocketInput"
    "videoPlayers videoPlayers videoPlayers videoPlayers"
    "videoPlayers videoPlayers videoPlayers videoPlayers";
}
.container > div {
  border: 1px solid silver;
}

.videoPlayers {
  grid-area: videoPlayers;
  display: grid;
  grid-template-areas:
    "videoJsPlayer videoJsPlayer videoJsPlayer2 videoJsPlayer2"
    "videoJsPlayer videoJsPlayer videoJsPlayer2 videoJsPlayer2";
}

.videoJsPlayer {
  grid-area: videoJsPlayer;
}

.videoJsPlayer video-js {
  position: relative;
}
.videoJsPlayer .video-wrapper-for-VideoJsPlayer {
  position: relative;
}
.videoJsPlayer2 .video-wrapper-for-VideoJsPlayer2 {
  position: relative;
}

.videoJsPlayer2 {
  grid-area: videoJsPlayer2;
}
.container .websocket_output {
  display: grid;
  height: 200px;
  grid-area: websocketOutput;
}
.container .divider {
  grid-column: 3;
  margin: 10px;
  border: 0px !important;
}

.container .websocket_input {
  display: grid;
  height: 200px;
  grid-area: websocketInput;
}
.container .websocket_input textarea {
  height: 100px;
}
.container .websocket_output .input_field {
  grid-row: 1;
}
.container .websocket_output button {
  grid-row: 2;
}
.overlay,
.overlay2 {
  position: absolute;
  background: rgba(0, 0, 0, 0);
  top: calc(100% - 30px);
  right: 0;
  bottom: 0;
  left: 0;
  transform: translateY(-100%);
  pointer-events: none;
}
</style>
