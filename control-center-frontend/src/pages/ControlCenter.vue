<template>
  <div class="container">
    <div class="selector_container">
      <label for="selector_overlay">Select an overlay:</label> <br />
      <select v-model="overlaySelected" name="selector_overlay">
        <option disabled value="">Please select an overlay</option>
        <option
          v-for="(overlay, key) in overlaysFromAWSOverlayTable"
          :key="key"
          :value="overlay"
        >
          {{ overlay?.["broadcastTitle"] }}
        </option>
      </select>
      <br />
      <div v-if="Object.keys(overlaySelected).length > 0">
        <select v-model="overlayContentSelected">
          <option disabled value="">
            Please select the overlay content to activate
          </option>
          <option
            v-for="overlayContentOption in Object.keys(
              overlaySelected?.overlayContent
            )"
            :key="overlayContentOption"
            :value="overlayContentOption"
          >
            {{
              overlaySelected.overlayContent[overlayContentOption]?.props?.title
            }}
          </option>
        </select>
        <button
          @click="
            triggerOverlayOnUsers(overlaySelected.id, overlayContentSelected)
          "
        >
          Activate
        </button>
      </div>
      <div>
        Selected:
        {{ overlaySelected?.["broadcastTitle"] }}
      </div>
      <button @click="refreshData">Refresh</button>
    </div>
    <br />
    <div class="questions_container">
      <div
        v-for="event in overlaySelected?.overlayContent"
        :key="event?.['id']"
      >
        <h2>
          Question: {{ event?.["props"]?.["title"] }} <br />
          ----------------------------------
        </h2>
        <h3>Options:</h3>
        <div v-for="option in event?.props?.options" :key="option?.['value']">
          <p>
            - {{ option?.["label"] }} with
            {{ event?.answers?.[option?.value]?.amount }} selections
          </p>
        </div>
      </div>
    </div>
    <div class="answers_container invisible">
      <div
        v-for="event in overlaySelected?.overlayContent"
        :key="event?.['id']"
      >
        <h2>
          Answers for: {{ event?.["props"]?.["title"] }} <br />
          ----------------------------------
        </h2>
        <h3>Options:</h3>
        <div v-for="answer in event?.answers" :key="answer">
          <p>- {{ answer?.["amount"] }}</p>
        </div>
      </div>
    </div>
  </div>
  <div class="websocket_connection_status">
    <p v-if="(connectionStatus = 'open')" class="bg-green-800">
      Connection is: {{ connectionStatus }}
    </p>
    <p v-else class="bg-red-800">Connection is: {{ connectionStatus }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { nanoid } from "nanoid";

const overlaysFromAWSOverlayTable = ref([]);
const overlaySelected = ref({});
const overlayContentSelected = ref({});
const connectionStatus = ref("");

const triggerOverlayOnUsers = (
  overlayToTrigger: String,
  overlayContentToTrigger: String
) => {
  webSocketConnection.send(
    `{"action":"triggerOverlayOnUsers", "content":{"overlayToTrigger":"${overlayToTrigger}", "overlayContentToTrigger":"${overlayContentToTrigger}"}}`
  );
};

const refreshData = () => {
  webSocketConnection.send(`{ "action": "getOverlays"}`);
};

let webSocketConnection: WebSocket;

webSocketConnection = new WebSocket(
  "wss://sonim20w02.execute-api.eu-central-1.amazonaws.com/v1"
);

webSocketConnection.onopen = async (event) => {
  console.log("onopen");
  console.log(event);
  connectionStatus.value = event.type;
  webSocketConnection.send(`{ "action": "getOverlays"}`);
};
webSocketConnection.onerror = (event) => {
  console.log("onerror");
  console.log(event);
  connectionStatus.value = event.type;
};

webSocketConnection.onclose = (event) => {
  connectionStatus.value = event.type;
};

webSocketConnection.onmessage = (event) => {
  console.log("onmessage");
  console.log(event);
  console.log(event.data);
  const parsedData = JSON.parse(event.data);
  console.log(parsedData);
  if (parsedData?.content?.overlays) {
    overlaysFromAWSOverlayTable.value = parsedData.content.overlays.Items;
    console.log(overlaysFromAWSOverlayTable.value);
  }
};
</script>

<style>
.container {
  @apply absolute top-2 left-2 w-full h-fit grid grid-cols-2 gap-4 grid-rows-2;
}
.selector_container {
  @apply bg-blue-600 text-left;
}

.selector_container button {
  @apply border-solid border-2 border-black rounded-md bg-slate-600;
}
.questions_container {
  @apply text-left;
}
.answers_container {
  @apply col-span-1;
}

.websocket_connection_status {
  @apply absolute left-0 bottom-0;
}
.websocket_connection_status p {
  @apply pl-2 pr-2;
}
</style>
