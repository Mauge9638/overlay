<template>
  <div
    :class="`${titlePropRef} overlay_container opacity-0 transition-all duration-500 ease-in-out`"
  >
    <component
      v-if="overlayChosenRef"
      :is="overlayComponentOptions?.[componentToLoad]"
      :props="
        overlays[desiredOverlayIdPropRef]?.overlayContent[overlayChosenRef]
          ?.props
      "
      @sendAnswerToOverlayContent="
        (answer) => onSendAnswerToOverlayContent(answer)
      "
    ></component>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, toRefs, watch } from "vue";
import OverlayMultiSelect from "./OverlayMultiSelect.vue";
import OverlaySelect from "./OverlaySelect.vue";
import { getCookie, setCookie } from "../helpers/cookieHandling";
const props = defineProps({
  title: { type: String, required: true },
  desiredOverlayId: { type: String, required: true },
  videoPlayerToAttachTo: { type: String, required: true },
  websocketUrl: { type: String, required: true },
});
const {
  desiredOverlayId: desiredOverlayIdPropRef,
  title: titlePropRef,
  videoPlayerToAttachTo: videoPlayerToAttachToPropRef,
  websocketUrl: websocketUrlToPropRef,
} = toRefs(props);

const overlayComponentOptions = {
  OverlaySelect: OverlaySelect,
  OverlayMultiSelect: OverlayMultiSelect,
};

const overlayChosenRef = ref("");
const overlays = ref({});
const componentToLoad = ref("");

let webSocketConnection: WebSocket;

watch(overlayChosenRef, () => {
  if (overlayChosenRef.value.length >= 1) {
    document
      .getElementsByClassName(titlePropRef.value)[0]
      .classList.remove("opacity-0");
    document
      .getElementsByClassName(titlePropRef.value)[0]
      .classList.add("opacity-100");
  }
});

const onSendAnswerToOverlayContent = (answer) => {
  console.log(answer);
  const overlayContainer = document.querySelector(`.${titlePropRef.value}`);
  webSocketConnection.send(
    JSON.stringify({
      action: "sendAnswerToOverlayContent",
      content: {
        overlayId: desiredOverlayIdPropRef.value,
        overlayContentId: overlayChosenRef.value,
        answer: answer,
        overlayCookieId: getCookie("overlayIdCookieKey"),
      },
    })
  );
  try {
    // @ts-ignore
    overlayContainer.classList.remove("opacity-100");
    // @ts-ignore
    overlayContainer.classList.add("opacity-0");
    setTimeout(() => {
      overlayChosenRef.value = "";
    }, 500);
  } catch (err) {
    console.log(err);
  }
};

webSocketConnection = new WebSocket(websocketUrlToPropRef.value);

const checkOverlayCookieIdValidity = async () => {
  console.log("Getting cookie with the name: overlayIdCookieKey");
  const overlayIdCookieKey = getCookie("overlayIdCookieKey");
  console.log("overlayIdCookieKey:", overlayIdCookieKey);
  console.log("Checking for validity");
  webSocketConnection.send(
    JSON.stringify({
      action: "checkOverlayCookieId",
      content: {
        overlayIdCookieKey: overlayIdCookieKey,
        connectedToOverlayId: desiredOverlayIdPropRef.value,
      },
    })
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
              JSON.stringify({
                action: "getOverlayContent",
                content: {
                  desiredOverlayId: desiredOverlayIdPropRef.value,
                },
              })
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
  } else if (parsedData?.subject == "triggerOverlayOnUsers") {
    overlayChosenRef.value = parsedData.content.overlayContentToTrigger;
    componentToLoad.value =
      overlays.value[desiredOverlayIdPropRef.value]?.overlayContent[
        overlayChosenRef.value
      ]?.componentName;
  }
};

onMounted(() => {
  setTimeout(() => {
    const overlay = document.querySelector(`.${titlePropRef.value}`);
    console.log(overlay);
    document
      .querySelector(`${videoPlayerToAttachToPropRef.value}`)
      .appendChild(overlay);
  });
});
</script>

<style>
.overlay_container {
  border: 2px solid #333;
  background: #162c41;
  @apply min-w-fit w-1/4 h-fit rounded-xl left-2 top-[calc(100%-38px)] absolute text-left pointer-events-auto p-2.5 -translate-y-full;
}
</style>
