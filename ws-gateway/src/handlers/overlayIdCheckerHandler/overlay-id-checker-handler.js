const aws = require("aws-sdk");
const crypto = require("crypto");
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
    } catch (err) {
      console.log("Error in send: ", err);
    }
  };

  return { connectionId, endpoint, send, routeKey };
};

const getConnectionsTableItem = async (idValue) => {
  return docClient
    .get({
      TableName: connectionsTable,
      Key: { id: idValue },
    })
    .promise();
};

const addToConnectionsTable = async (idValue, additionalContent) => {
  return docClient
    .put({
      TableName: connectionsTable,
      Item: {
        id: idValue,
        ...additionalContent,
      },
    })
    .promise();
};

const updateConnectionsTable = async (
  idValue,
  UpdateExpression,
  ExpressionAttributeValues
) => {
  return docClient
    .update({
      TableName: connectionsTable,
      Key: { id: idValue },
      UpdateExpression: UpdateExpression,
      ExpressionAttributeValues: ExpressionAttributeValues,
    })
    .promise();
};

exports.overlayIdCheckerHandler = async (event) => {
  if (event.requestContext) {
    const { send, connectionId, routeKey } = getSocketContext(event);
    let body = {};

    try {
      if (event.body) {
        body = JSON.parse(event.body);
      }
    } catch (error) {
      console.log("Error in try catch for event.body");
    }

    switch (routeKey) {
      case "checkOverlayCookieId":
        const { overlayIdCookieKey, connectedToOverlayId } = body?.content;
        if (overlayIdCookieKey && connectedToOverlayId) {
          try {
            return getConnectionsTableItem(overlayIdCookieKey)
              .then((data) => {
                if (Object.keys(data).length <= 0) {
                  const newOverlayIdCookieKey = crypto.randomUUID();
                  return addToConnectionsTable(newOverlayIdCookieKey, {
                    currentConnectionId: connectionId,
                    connectedToOverlayId: connectedToOverlayId,
                  })
                    .then(() => {
                      return send(connectionId, {
                        subject: "checkOverlayCookieId",
                        content: {
                          newOverlayIdCookieKey: newOverlayIdCookieKey,
                        },
                      });
                    })
                    .then(() => {
                      return Promise.resolve();
                    });
                } else {
                  return updateConnectionsTable(
                    overlayIdCookieKey,
                    "set connectedToOverlayId = :connectedToOverlayId, currentConnectionId = :currentConnectionId",
                    {
                      ":connectedToOverlayId": connectedToOverlayId,
                      ":currentConnectionId": connectionId,
                    }
                  ).then(() => {
                    return send(connectionId, {
                      subject: "checkOverlayCookieId",
                      message: "overlayCookieId exists in db",
                    }).then(() => {
                      return Promise.resolve();
                    });
                  });
                }
              })
              .then(() => {
                const response = {
                  isBase64Encoded: false,
                  statusCode: 200,
                  body: "",
                };

                return response;
              })
              .catch((err) => {
                console.log(err);
                const response = {
                  isBase64Encoded: false,
                  statusCode: 400,
                  body: "",
                };

                return response;
              });
          } catch (err) {
            const response = {
              isBase64Encoded: false,
              statusCode: 400,
              body: "",
            };
            return response;
          }
        } else if (overlayIdCookieKey == "" && connectedToOverlayId) {
          try {
            const newOverlayIdCookieKey = crypto.randomUUID();
            return addToConnectionsTable(newOverlayIdCookieKey, {
              currentConnectionId: connectionId,
              connectedToOverlayId: connectedToOverlayId,
            })
              .then(() => {
                return send(connectionId, {
                  subject: "checkOverlayCookieId",
                  content: { newOverlayIdCookieKey: newOverlayIdCookieKey },
                });
              })
              .then(() => {
                return Promise.resolve();
              })
              .then(() => {
                const response = {
                  isBase64Encoded: false,
                  statusCode: 200,
                  body: "",
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
          const response = {
            isBase64Encoded: false,
            statusCode: 400,
            body: `You must supply both overlayIdCookieKey & connectedToOverlayId, wrapped in content as such: {content: {overlayIdCookieKey: overlayIdCookieKey, connectedToOverlayId: connectedToOverlayId}}`,
          };
          return response;
        }
        break;
      default:
        const response = {
          isBase64Encoded: false,
          statusCode: 400,
          body: "",
        };
        return response;
    }
  }
  // const response = {
  //   isBase64Encoded: false,
  //   statusCode: 200,
  //   body: "",
  // };

  // return response;

  // Creates a new item, or replaces an old item with a new item
  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#put-property

  // const msg = `Connection successful, your connectionId: ${connectionId} has been added to the database`;

  // await send(msg);
};
