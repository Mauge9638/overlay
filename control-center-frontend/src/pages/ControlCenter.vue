<template>
  <div>
    <div class="container">
      <div class="selector_container">
        <label for="selector_overlay">Select an overlay:</label> <br />
        <select v-model="overlaySelected" name="selector_overlay">
          <option disabled value="">Please select an overlay</option>
          <option
            v-for="{ broadcastTitle, id } in overlaysFromAWSOverlayTable"
            :key="id"
            :value="id"
          >
            {{ broadcastTitle }}
          </option>
        </select>
        <br />
        <div v-if="overlaySelected">
          <select v-model="overlayContentSelected">
            <option disabled value="">
              Please select the overlay content to activate
            </option>
            <option
              v-for="overlayContentOption in Object.keys(
                overlaysFromAWSOverlayTable.find(
                  (object) => object.id == overlaySelected
                ).overlayContent
              )"
              :key="overlayContentOption"
              :value="overlayContentOption"
            >
              {{
                overlaysFromAWSOverlayTable.find(
                  (object) => object.id == overlaySelected
                ).overlayContent[overlayContentOption]?.props?.title
              }}
            </option></select
          ><br />
          <button
            @click="
              triggerOverlayOnUsers(overlaySelected, overlayContentSelected)
            "
          >
            Activate overlay content on users
          </button>
          <br />
          <button @click="refreshData">Refresh data</button>
          <button @click="refreshDataEvery">
            Refresh data every {{ refreshDataFrequency / 1000 }} seconds
          </button>
          <input
            class="pl-2 w-20"
            v-model="refreshDataFrequency"
            type="number"
            min="1000"
          />
        </div>
      </div>
      <br />
      <div class="questions_container">
        <div
          v-for="event in overlaysFromAWSOverlayTable.find(
            (object) => object.id == overlaySelected
          )?.overlayContent"
          :key="event?.['id']"
        >
          <hr />
          <h4
            class="font-medium leading-tight text-2xl mt-0 mb-2 text-blue-600"
          >
            Question: {{ event?.["props"]?.["title"] }} <br />
          </h4>
          <h5 class="font-medium leading-tight text-xl mt-0 mb-2 text-blue-400">
            Options:
          </h5>
          <div
            v-for="option in event?.props?.options"
            :key="option?.['value']"
            class="mb-2"
          >
            <p class="font-bold">{{ option?.["label"] }} <br /></p>
            {{ event?.answers?.[option?.value]?.amount }} selections
          </div>
        </div>
      </div>
      <div class="answers_container invisible">
        <div
          v-for="event in overlaySelected?.overlayContent"
          :key="event?.['id']"
        >
          <h2>Answers for: {{ event?.["props"]?.["title"] }} <br /></h2>
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
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { nanoid } from "nanoid";

const overlaysFromAWSOverlayTable = ref([]);
const overlaySelected = ref("");
const overlayContentSelected = ref({});
const connectionStatus = ref("");
const refreshDataFrequency = ref(30000);

const triggerOverlayOnUsers = (
  overlayToTrigger: String,
  overlayContentToTrigger: String
) => {
  webSocketConnection.send(
    `{"action":"triggerOverlayOnUsers", "content":{"clientWebsocketApiKey":"${
      import.meta.env.VITE_WEBSOCKET_API_KEY
    }", "overlayToTrigger":"${overlayToTrigger}", "overlayContentToTrigger":"${overlayContentToTrigger}"}}`
  );
};

const refreshData = () => {
  webSocketConnection.send(`{ "action": "getOverlays"}`);
};

const refreshDataEvery = () => {
  setInterval(() => {
    refreshData();
  }, refreshDataFrequency.value);
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
  @apply absolute top-2 left-2 w-full h-fit grid grid-cols-2 gap-4 grid-rows-1;
}
.selector_container {
  @apply text-left col-span-1;
}

.selector_container select {
  @apply border-solid border-2 border-gray-400 rounded-md bg-slate-800 mt-2;
}
.questions_container {
  @apply text-left col-span-1;
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
button {
  @apply pl-2 pr-2 mr-2 border-solid border-2 border-black rounded-md bg-slate-600 mt-2;
}
</style>
