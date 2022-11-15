<template>
  <div class="container">
    <div class="container_overlay">
      <label for="selector_overlay">Vælg et overlay:</label>
      <select v-model="overlaySelected" name="selector_overlay">
        <option disabled value="">Please select one</option>
        <option
          v-for="(overlay, key) in overlaysFromAWSOverlayTable"
          :key="key"
          :value="overlay"
        >
          {{ overlay?.["id"] }}
        </option>
      </select>
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

// const dummyOverlays = [
//   {
//     id: nanoid(),
//     title: "Overlay 1",
//     usersConnected: Math.round(Math.random() * 1000),
//     events: [
//       { id: nanoid(), title: "Question about politicians" },
//       { id: nanoid(), title: "Poll on airlines" },
//       { id: nanoid(), title: "Poll on fruits" },
//     ],
//   },
//   {
//     id: nanoid(),
//     title: "Overlay 2",
//     usersConnected: Math.round(Math.random() * 1000),
//     events: [
//       { id: nanoid(), title: "on public transport", type: "Poll" },
//       { id: nanoid(), title: "on vegetables", type: "Poll" },
//       { id: nanoid(), title: "about cars", type: "Question" },
//     ],
//   },
//   {
//     id: nanoid(),
//     title: "Overlay 3",
//     usersConnected: Math.round(Math.random() * 1000),
//     events: [
//       { id: nanoid(), title: "on economy", type: "Poll" },
//       { id: nanoid(), title: "about politicians", type: "Question" },
//       { id: nanoid(), title: "on bread", type: "Poll" },
//     ],
//   },
//   {
//     id: nanoid(),
//     title: "Overlay 4",
//     usersConnected: Math.round(Math.random() * 1000),
//     events: [
//       { id: nanoid(), title: "on work commute", type: "Question" },
//       { id: nanoid(), title: "on income level", type: "Question" },
//       { id: nanoid(), title: "on eating habits", type: "Poll" },
//     ],
//   },
// ];

const overlaysFromAWSOverlayTable = ref([]);

const overlaySelected = ref({
  id: "",
  title: "None selected",
  usersConnected: "",
  events: [],
});

let webSocketConnection: WebSocket;

webSocketConnection = new WebSocket(
  "wss://sonim20w02.execute-api.eu-central-1.amazonaws.com/v1"
);
webSocketConnection.onopen = async (event) => {
  console.log("onopen");
  console.log(event);
  webSocketConnection.send(`{ "action": "getOverlays"}`);
};
webSocketConnection.onerror = (event) => {
  console.log("onerror");
  console.log(event);
};
webSocketConnection.onmessage = (event) => {
  console.log("onmessage");
  console.log(event);
  console.log(event.data);
  const parsedData = JSON.parse(event.data);
  console.log(parsedData);
  if (parsedData?.overlays) {
    overlaysFromAWSOverlayTable.value = parsedData.overlays.Items;
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
