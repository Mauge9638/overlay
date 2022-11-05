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
    </div>
    <div class="videoPlayers">
      <Overlay class="overlay" :options="overlayOptions" />
      <Overlay class="overlay2" :options="overlayOptions" />
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

webSocketConnection = new WebSocket(
  "wss://e3uce08hu5.execute-api.eu-central-1.amazonaws.com/v1"
);
webSocketConnection.onopen = (event) => {
  console.log("onopen");
  console.log(event);
  connectionStatus.value = event.type;
};
webSocketConnection.onerror = (event) => {
  console.log("onerror");
  console.log(event);
  connectionStatus.value = event.type;
};
webSocketConnection.onmessage = (event) => {
  console.log("onmessage");
  console.log(event.data);
  inputMessage.value = JSON.parse(event.data).message;
};

const sendMessage = () => {
  console.log(outputMessage.value);
  webSocketConnection.send(
    `{ "action": "test", "name": "${outputMessage.value}"}`
  );
};
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
