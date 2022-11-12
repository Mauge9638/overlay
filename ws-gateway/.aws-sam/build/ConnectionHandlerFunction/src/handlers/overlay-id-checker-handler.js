const aws = require("aws-sdk");
const crypto = require("crypto");
// const dynamodb = require("aws-sdk/clients/dynamodb");
const docClient = new aws.DynamoDB.DocumentClient();
const tableName = process.env.CONNECTIONS_TABLE;

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

const checkConnectionsTable = async (value) => {
  return docClient
    .get({
      TableName: tableName,
      Key: { id: value },
    })
    .promise();
};

const addToConnectionsTable = async (idValue, connectionValue) => {
  return docClient
    .put({
      TableName: tableName,
      Item: {
        id: idValue,
        currentConnectionId: connectionValue,
        currentlyConnected: true,
        overlays: {
          overlay1: {
            a71yP3dJbmaFfsMra7TR: { answered: true },
            YwfJuyDsRtpQQxduab8c: { answered: false },
            EFryiW2ZMUxb_InlnkrP: { answered: false },
          },
          overlay2: { key1: "yes", key2: "no", key3: true },
          overlay3: { key1: "yes", key2: "no", key3: true },
        },
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
      TableName: tableName,
      Key: { id: idValue },
      UpdateExpression: UpdateExpression,
      ExpressionAttributeValues: ExpressionAttributeValues,
    })
    .promise();
};

const scanConnectionsTable = async (
  FilterExpression,
  ExpressionAttributeValues
) => {
  return docClient
    .scan({
      TableName: tableName,
      FilterExpression: FilterExpression,
      ExpressionAttributeValues: ExpressionAttributeValues,
    })
    .promise();
};

exports.overlayIdCheckerHandler = async (event) => {
  if (event.requestContext) {
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

    switch (routeKey) {
      case "test":
        return send(connectionId, {
          message: `This response was pushed through Lambda by the user: ${body?.name}. To the user with connectionId: ${connectionId}`,
        })
          .then(() => {
            return Promise.resolve();
          })
          .then(() => {
            const response = {
              isBase64Encoded: false,
              statusCode: 400,
              body: "",
            };
            return response;
          });
      case "checkOverlayCookieId":
        if (body?.overlayIdCookieKey) {
          const overlayIdCookieKey = body?.overlayIdCookieKey;
          try {
            return checkConnectionsTable(overlayIdCookieKey)
              .then((data) => {
                if (Object.keys(data).length <= 0) {
                  const newOverlayIdCookieKey = crypto.randomUUID();
                  return addToConnectionsTable(
                    newOverlayIdCookieKey,
                    connectionId
                  )
                    .then(() => {
                      return send(connectionId, {
                        newOverlayIdCookieKey: newOverlayIdCookieKey,
                      });
                    })
                    .then(() => {
                      return Promise.resolve();
                    });
                } else {
                  return updateConnectionsTable(
                    overlayIdCookieKey,
                    "set currentlyConnected = :currentlyConnected, currentConnectionId = :currentConnectionId",
                    {
                      ":currentConnectionId": connectionId,
                      ":currentlyConnected": true,
                    }
                  ).then(() => {
                    return send(connectionId, {
                      message: "overlayCookieId exists in db",
                    }).then(() => {
                      return Promise.resolve();
                    });
                  });
                }
              })
              .then(() => {
                console.log("Scan on table");
                return scanConnectionsTable(
                  "currentlyConnected = :currentlyConnected",
                  {
                    ":currentlyConnected": true,
                  }
                );
              })
              .then((data) => {
                console.log(data);
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
              })
              .finally(() => {});
          } catch (err) {
            const response = {
              isBase64Encoded: false,
              statusCode: 400,
              body: "",
            };
            return response;
          }
        }
        break;
      case "sendToAllUsers":
        break;

      default:
        break;
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
