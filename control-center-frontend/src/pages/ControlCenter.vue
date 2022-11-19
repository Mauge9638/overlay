<template>
  <div class="container">
    <div class="container_overlay">
      Connection is: {{ connectionStatus }} <br />
      <label for="selector_overlay">Vælg et overlay:</label>
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
    </div>
    <div class="container_overlay">
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
          <p>- {{ option?.["label"] }}</p>
        </div>
      </div>
    </div>
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

<style scoped>
.container {
  display: grid;
}
.container_selector {
  grid-column: 1 / span 2;
}

.container_overlay {
  grid-column: 4 / span 2;
}
</style>
