const aws = require("aws-sdk");
// const dynamodb = require("aws-sdk/clients/dynamodb");
const docClient = new aws.DynamoDB.DocumentClient();
const connectionsTable = process.env.CONNECTIONS_TABLE;
const overlayTable = process.env.OVERLAY_TABLE;

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
    } catch (error) {
      console.log("Error in send: ", err);
    }
  };

  return { connectionId, endpoint, send, routeKey };
};

const updateOverlayTable = async (
  idValue,
  UpdateExpression,
  ExpressionAttributeValues
) => {
  return docClient
    .update({
      TableName: overlayTable,
      Key: { id: idValue },
      UpdateExpression: UpdateExpression,
      ExpressionAttributeValues: ExpressionAttributeValues,
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

const getOverlayTableItem = async (value) => {
  return docClient
    .get({
      TableName: overlayTable,
      Key: { id: value },
    })
    .promise();
};

exports.overlayHandler = async (event) => {
  console.log(JSON.stringify(event, 2));
  console.log("event");
  console.log(event);
  if (event.requestContext) {
    console.log("event.requestContext");
    console.log(event.requestContext);
    const { send } = getSocketContext(event);
    const connectionId = event.requestContext.connectionId;
    const routeKey = event.requestContext.routeKey;
    let body = {};

    try {
      if (event.body) {
        body = JSON.parse(event.body);
      }
    } catch (error) {
      console.log("Error in try catch for event.body");
    }

    console.log(routeKey);
    switch (routeKey) {
      case "getOverlays":
        try {
          return scanOverlayTable(null, null)
            .then((data) => {
              console.log(data);
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
        if (body?.idValue && body?.broadcastTitle && body?.overlayContent) {
          const { idValue, broadcastTitle, overlayContent } = body;
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
        try {
          if (body?.desiredOverlayId) {
            const desiredOverlayId = body?.desiredOverlayId;
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
