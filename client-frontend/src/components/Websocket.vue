<template>
  <div class="container">
    <div class="videoPlayers">
      <div class="cookie_dialog bg-red-600">
        <p>This page utilizes an overlay for the video, which uses 1 cookie.</p>
        <p>
          The cookie will not be used for any data harvesting, and is solely
          used for coordinating overlay execution,
        </p>
        <p>
          denying the cookie wont stop the rest of the page or video from
          working.
        </p>
        <p>The cookie will be saved under the name: "overlayIdCookieKey"</p>
        <button @click="acceptCookie" class="!bg-green-500 !text-black">
          Accept
        </button>
        <button @click="rejectCookie" class="!bg-red-500">Deny</button>
      </div>
      <overlay
        v-if="acceptedCookie"
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
        <video-js-component
          :options="videoJsOptions"
          title="VideoJsPlayer"
        ></video-js-component>
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
import VideoJsComponent from "./VideoJsComponent.vue";
import ironGrip from "../assets/videos/irongrip.mp4";
import OSGILab from "../assets/videos/OSGILab.mp4";
import { getCookie } from "../helpers/cookieHandling";

const acceptedCookie = ref(false);

const videoJsOptions = {
  autoplay: "any",
  preload: "auto",
  controls: true,
  fluid: true,
  sources: { src: OSGILab, type: "video/mp4" },
};

const acceptCookie = () => {
  acceptedCookie.value = true;
  setTimeout(() => {
    document.querySelector(`.cookie_dialog`)?.remove();
  }, 350);
};

const rejectCookie = () => {
  acceptedCookie.value = false;
  setTimeout(() => {
    document.querySelector(`.cookie_dialog`)?.remove();
  }, 350);
};

onMounted(() => {
  const cookie = getCookie("overlayIdCookieKey");
  const cookieDialog = document.querySelector(`.cookie_dialog`);
  if (cookie === "") {
    setTimeout(() => {
      console.log(cookieDialog);
      if (cookieDialog) {
        document
          .querySelector(`.videoJsPlayer`)
          ?.getElementsByTagName("video-js")[0]
          .appendChild(cookieDialog);
      }
    });
  } else {
    cookieDialog?.remove();
    acceptedCookie.value = true;
  }
});
</script>

<style>
.container {
  display: grid;
  grid-template-columns: 100vw;
  grid-template-rows: auto;
  grid-template-areas: "videoPlayers";
  @apply absolute left-0 top-0;
}
.container > div {
  @apply border-2 border-solid border-gray-500;
}

.videoPlayers {
  grid-area: videoPlayers;
  display: grid;
  grid-template-areas: "videoJsPlayer";
  @apply w-screen h-screen;
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

.cookie_dialog {
  border: 2px solid #333;
  background: RGBA(22, 44, 64, 0.8);
  @apply min-w-fit w-1/4 h-fit rounded-xl left-2 top-[calc(100%-38px)] absolute text-center text-sm pointer-events-auto p-2.5 -translate-y-full;
}

.cookie_dialog button {
  @apply pl-2 pr-2 mr-2 border-solid border-2 border-black rounded-md mt-2 text-base;
}
.cookie_dialog button:focus {
  @apply animate-ping;
}
</style>
