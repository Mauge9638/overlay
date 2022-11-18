<template>
  <div class="container">
    <div class="videoPlayers">
      <Overlay
        desired-overlay-id="as5pionaspo5napsot"
        title="overlay_container_1"
        video-player-to-attach-to="videoJsPlayer"
      />
      <!-- <Overlay
        desired-overlay-id="as5pionaspo5napsot"
        title="overlay_container_2"
        video-player-to-attach-to="videoJsPlayer2"
      /> -->
      <div class="videoJsPlayer">
        <VideoJSComponent
          :options="videoJsOptions"
          title="VideoJsPlayer"
        ></VideoJSComponent>
      </div>
      <!-- <div class="videoJsPlayer2">
        <VideoJSComponent
          :options="videoJsOptions2"
          title="VideoJsPlayer2"
        ></VideoJSComponent>
      </div> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import Overlay from "./Overlay.vue";
import VideoJSComponent from "./VideoJSComponent.vue";
import ironGrip from "../assets/videos/irongrip.mp4";
import rushingB from "../assets/videos/rushingb.mp4";

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
/*
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
*/
</style>
