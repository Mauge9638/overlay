const aws = require("aws-sdk");
const https = require("https");
// const dynamodb = require("aws-sdk/clients/dynamodb");
const docClient = new aws.DynamoDB.DocumentClient();
const connectionsTable = process.env.CONNECTIONS_TABLE;
const overlayTable = process.env.OVERLAY_TABLE;
const websocketApiKey = process.env.WEBSOCKET_API_KEY;

const getSocketContext = (event) => {
  const { domainName, stage, connectionId, routeKey } = event.requestContext;
  const endpoint = `${domainName}/${stage}/`;

  const apigwManagementApi = new aws.ApiGatewayManagementApi({
    endpoint: endpoint,
  });

  const send = async (connectionId, data) => {
    try {
      await apigwManagementApi
        .postToConnection({
          ConnectionId: connectionId,
          Data: Buffer.from(JSON.stringify(data)),
        })
        .promise();
    } catch (err) {
      if (err.code == "GoneException") {
        return scanConnectionsTable({
          FilterExpression: "currentConnectionId = :currentConnectionId",
          ExpressionAttributeValues: { ":currentConnectionId": connectionId },
        })
          .then((data) => {
            const key = data.Items[0].id;
            return updateConnectionsTable(key, {
              UpdateExpression:
                "set connectedToOverlayId = :connectedToOverlayId, currentConnectionId = :currentConnectionId",
              ExpressionAttributeValues: {
                ":connectedToOverlayId": null,
                ":currentConnectionId": null,
              },
            });
          })
          .then(() => {
            return Promise.resolve();
          });
      }
      console.log("Error in send: ", err);
    }
  };

  return { connectionId, endpoint, send, routeKey };
};

const updateConnectionsTable = async (idValue, expressions) => {
  return docClient
    .update({
      TableName: connectionsTable,
      Key: { id: idValue },
      ...expressions,
    })
    .promise();
};

const updateOverlayTable = async (idValue, expressions) => {
  return docClient
    .update({
      TableName: overlayTable,
      Key: { id: idValue },
      ...expressions,
    })
    .promise();
};

const scanOverlayTable = async (
  FilterExpression,
  ExpressionAttributeValues
) => {
  if (FilterExpression || ExpressionAttributeValues) {
    return docClient
      .scan({
        TableName: overlayTable,
        FilterExpression: FilterExpression,
        ExpressionAttributeValues: ExpressionAttributeValues,
      })
      .promise();
  } else {
    return docClient.scan({ TableName: overlayTable }).promise();
  }
};

const scanConnectionsTable = async (expressions) => {
  if (expressions) {
    return docClient
      .scan({
        TableName: connectionsTable,
        ...expressions,
      })
      .promise();
  } else {
    return docClient.scan({ TableName: connectionsTable }).promise();
  }
};

const addToOverlayTable = async (idValue, broadcastTitle, overlayContent) => {
  return docClient
    .put({
      TableName: overlayTable,
      Item: {
        id: idValue,
        broadcastTitle: broadcastTitle,
        overlayContent: overlayContent,
      },
    })
    .promise();
};

const getOverlayTableItem = async (idValue) => {
  return docClient
    .get({
      TableName: overlayTable,
      Key: { id: idValue },
    })
    .promise();
};

const getConnectionsTableItem = async (idValue) => {
  return docClient
    .get({
      TableName: connectionsTable,
      Key: { id: idValue },
    })
    .promise();
};

exports.overlayHandler = async (event) => {
  if (event.requestContext) {
    const { send } = getSocketContext(event);
    const connectionId = event.requestContext.connectionId;
    const routeKey = event.requestContext.routeKey;
    let body = {};

    try {
      if (event.body) {
        body = JSON.parse(event.body);
      }
    } catch (err) {
      console.log("Error in try catch for event.body: ", err);
    }

    console.log(routeKey);
    switch (routeKey) {
      case "getOverlays":
        try {
          return scanOverlayTable(null, null)
            .then((data) => {
              return send(connectionId, {
                subject: "getOverlays",
                content: {
                  overlays: data,
                },
              });
            })
            .then(() => {
              return Promise.resolve();
            })
            .then(() => {
              const response = {
                isBase64Encoded: false,
                statusCode: 200,
                body: "Success in executing action",
              };

              return response;
            });
        } catch (err) {
          console.log(err);
          const response = {
            isBase64Encoded: false,
            statusCode: 400,
            body: "",
          };

          return response;
        }
        break;
      case "addOverlay":
        const { idValue, broadcastTitle, overlayContent } = body?.content;
        if (idValue && broadcastTitle && overlayContent) {
          try {
            return addToOverlayTable(idValue, broadcastTitle, overlayContent)
              .then(() => {
                send(connectionId, {
                  subject: "addOverlay",
                  message: `A new overlay with the id ${idValue}, has been added`,
                });
              })
              .then(() => {
                return Promise.resolve();
              })
              .then(() => {
                const response = {
                  isBase64Encoded: false,
                  statusCode: 200,
                  body: "Success in executing action",
                };

                return response;
              });
          } catch (err) {
            const response = {
              isBase64Encoded: false,
              statusCode: 400,
              body: `An error occured: ${err}`,
            };

            return response;
          }
        } else {
          try {
            return send(connectionId, {
              subject: "addOverlay",
              message: "idValue, broadcastTitle & overlayContent is required",
            }).then(() => {
              return Promise.resolve();
            });
          } catch (err) {
            const response = {
              isBase64Encoded: false,
              statusCode: 400,
              body: `An error occured: ${err}`,
            };

            return response;
          }
        }
      case "getOverlayContent":
        const { desiredOverlayId } = body?.content;
        try {
          if (desiredOverlayId) {
            return getOverlayTableItem(desiredOverlayId).then((data) => {
              return send(connectionId, {
                subject: "getOverlayContent",
                content: {
                  overlayContent: data,
                },
              })
                .then(() => {
                  return Promise.resolve();
                })
                .then(() => {
                  const response = {
                    isBase64Encoded: false,
                    statusCode: 200,
                    body: "Success in executing action",
                  };

                  return response;
                });
            });
          } else {
            return send(connectionId, {
              subject: "getOverlayContent",
              message: "The action must contain <'desiredOverlayId': 'String'>",
            })
              .then(() => {
                return Promise.resolve();
              })
              .then(() => {
                const response = {
                  isBase64Encoded: false,
                  statusCode: 400,
                  body: "Missing content in body",
                };

                return response;
              });
          }
        } catch (err) {
          const response = {
            isBase64Encoded: false,
            statusCode: 400,
            body: `An error occured: ${err}`,
          };

          return response;
        }
      case "triggerOverlayOnUsers":
        const {
          overlayToTrigger,
          overlayContentToTrigger,
          clientWebsocketApiKey,
        } = body?.content;
        if (
          overlayToTrigger &&
          overlayContentToTrigger &&
          websocketApiKey === clientWebsocketApiKey
        ) {
          try {
            return scanConnectionsTable({
              FilterExpression:
                "connectedToOverlayId = :overlayToTrigger AND NOT contains(answered.#overlayToTrigger, :overlayContentToTrigger)",
              ExpressionAttributeNames: {
                "#overlayToTrigger": overlayToTrigger,
              },
              ExpressionAttributeValues: {
                ":overlayToTrigger": overlayToTrigger,
                ":overlayContentToTrigger": overlayContentToTrigger,
              },
            })
              .then((data) => {
                const usersToSendTo = data.Items.map(async (item) => {
                  return send(item.currentConnectionId, {
                    subject: "triggerOverlayOnUsers",
                    content: {
                      overlayContentToTrigger: overlayContentToTrigger,
                    },
                  });
                });
                return usersToSendTo;
              })
              .then(async (usersToSendTo) => {
                return Promise.all(usersToSendTo);
              })
              .then(() => {
                return send(connectionId, {
                  subject: "triggerOverlayOnUsers",
                  message:
                    "Overlays triggered on users associated with overlay",
                });
              })
              .then(() => {
                return Promise.resolve();
              })
              .then(() => {
                const response = {
                  isBase64Encoded: false,
                  statusCode: 200,
                  body: "Success",
                };
                return response;
              });
          } catch (err) {
            const response = {
              isBase64Encoded: false,
              statusCode: 400,
              body: err,
            };
            return response;
          }
        } else {
          const response = {
            isBase64Encoded: false,
            statusCode: 400,
            body: "Please supply both overlayToTrigger, overlayContentToTrigger & clientWebsocketApiKey wrapped in content",
          };
          return response;
        }
      case "sendAnswerToOverlayContent":
        const { overlayId, overlayContentId, answer, overlayCookieId } =
          body?.content;
        if (overlayId && overlayContentId && answer && overlayCookieId) {
          try {
            return getConnectionsTableItem(overlayCookieId)
              .then((result) => {
                console.log(result);
                if (result?.Item?.answered?.[overlayId]) {
                  return updateConnectionsTable(overlayCookieId, {
                    UpdateExpression:
                      "set answered.#overlayId = list_append(answered.#overlayId, :overlayContentId)",
                    ExpressionAttributeNames: { "#overlayId": overlayId },
                    ExpressionAttributeValues: {
                      ":overlayContentId": [overlayContentId],
                    },
                  });
                } else {
                  return updateConnectionsTable(overlayCookieId, {
                    UpdateExpression: "set answered = :value",
                    ExpressionAttributeValues: {
                      ":value": { [overlayId]: [overlayContentId] },
                    },
                  });
                }
              })
              .then((data) => {
                console.log(data);
              })
              .then(() => {
                return getOverlayTableItem(overlayId).then((data) => {
                  console.log(data.Item);
                  return data?.Item?.overlayContent?.[overlayContentId];
                });
              })
              .then((overlayContent) => {
                if (
                  overlayContent.answerType == "Integer" ||
                  overlayContent.answerType == "Multiple Integer"
                ) {
                  let updateExpression = "add";
                  let expressionAttributeNames = {
                    "#overlayContentId": overlayContentId,
                  };
                  const answerAsArray =
                    typeof answer == "string" ? [answer] : answer;
                  for (const answer in answerAsArray) {
                    if (answer != 0) {
                      updateExpression += ",";
                    }
                    updateExpression += ` overlayContent.#overlayContentId.answers.#${answerAsArray[answer]}.amount :incrementWithOne`;
                    expressionAttributeNames[`#${answerAsArray[answer]}`] =
                      answerAsArray[answer];
                  }
                  return updateOverlayTable(overlayId, {
                    UpdateExpression: updateExpression,
                    ExpressionAttributeNames: expressionAttributeNames,
                    ExpressionAttributeValues: {
                      ":incrementWithOne": 1,
                    },
                  })
                    .then((data) => {
                      console.log(data);
                      return send(connectionId, {
                        subject: "sendAnswerToOverlayContent",
                        message: "Your answer was successfully registered",
                      });
                    })
                    .then(() => {
                      return Promise.resolve();
                    })
                    .then(() => {
                      const response = {
                        isBase64Encoded: false,
                        statusCode: 200,
                        body: "Success in operation",
                      };
                      return response;
                    });
                }
              });
          } catch (err) {
            const response = {
              isBase64Encoded: false,
              statusCode: 400,
              body: err,
            };
            return response;
          }
        } else {
          const response = {
            isBase64Encoded: false,
            statusCode: 400,
            body: "Please supply overlayId & overlayContentId & answer wrapped in content",
          };
          return response;
        }
      case "sendToAllUsers":
        break;

      default:
        const response = {
          isBase64Encoded: false,
          statusCode: 400,
          body: "Route does not exist",
        };
        return response;
    }
  }

  // Creates a new item, or replaces an old item with a new item
  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#put-property

  // const msg = `Connection successful, your connectionId: ${connectionId} has been added to the database`;

  // await send(msg);
};
