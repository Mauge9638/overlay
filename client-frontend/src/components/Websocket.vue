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
      <div class="overlay" @click="test"><p>This is the overlay</p></div>
      <div class="overlay2" @click="test"><p>This is the overlay</p></div>
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
import VideoJSComponent from "./VideoJSComponent.vue";
import ironGrip from "../assets/videos/irongrip.mp4";
import rushingB from "../assets/videos/rushingb.mp4";

const videoJsOptions = {
  autoplay: "any",
  preload: "auto",
  controls: true,
  fill: true,
  playbackRates: [0.5, 1, 1.5, 2],
  sources: { src: ironGrip, type: "video/mp4" },
};
const videoJsOptions2 = {
  autoplay: "any",
  preload: "auto",
  controls: true,
  fill: true,
  playbackRates: [0.5, 1, 1.5, 2],
  sources: { src: rushingB, type: "video/mp4" },
};

const inputMessage = ref("");
const outputMessage = ref("");
const connectionStatus = ref();

const test = () => {
  console.log("test");
};

let webSocketConnection: WebSocket;

onMounted(() => {
  const overlay = document.getElementsByClassName("overlay")[0];
  document
    .getElementsByClassName("videoJsPlayer")[0]
    .getElementsByClassName("video-wrapper")[0]
    .appendChild(overlay);
  const overlay2 = document.getElementsByClassName("overlay2")[0];
  document
    .getElementsByClassName("videoJsPlayer2")[0]
    .getElementsByClassName("video-wrapper")[0]
    .appendChild(overlay2);
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
.videoJsPlayer .video-wrapper {
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
.overlay {
  position: relative;
  width: 500px;
  margin: 0 auto;
  padding: 20px;
}
.overlay {
  position: absolute;
  background: rgba(138, 39, 64, 0.5);
  border-radius: 5px;
  height: 100px;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  pointer-events: none;
}
.overlay p {
  background: blue;
  pointer-events: all;
}
.overlay2 {
  position: absolute;
  background: rgba(138, 39, 64, 0.5);
  border-radius: 5px;
  height: 100px;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  pointer-events: none;
}
.overlay2 p {
  background: blue;
  pointer-events: all;
}
</style>
