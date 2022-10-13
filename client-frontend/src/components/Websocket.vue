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
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";

const inputMessage = ref("");
const outputMessage = ref("");
const connectionStatus = ref();

let webSocketConnection: WebSocket;

webSocketConnection = new WebSocket(
  "wss://zl9fcztz5j.execute-api.eu-central-1.amazonaws.com/v1"
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
  display: grid;
  grid: 100px / auto auto auto;
}
.container > div {
  border: 1px solid silver;
}
.container .websocket_output {
  grid-column: 1;
  display: grid;
  height: 200px;
}
.container .divider {
  grid-column: 2;
  margin: 10px;
  border: 0px !important;
}

.container .websocket_input {
  grid-column: 4;
  display: grid;
  height: 200px;
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
</style>
