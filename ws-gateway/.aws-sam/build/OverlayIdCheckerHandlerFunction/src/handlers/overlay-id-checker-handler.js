const aws = require("aws-sdk");
// const dynamodb = require("aws-sdk/clients/dynamodb");
const docClient = new aws.DynamoDB.DocumentClient();
const tableName = process.env.SAMPLE_TABLE;

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

exports.overlayIdCheckerHandler = async (event) => {
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
      case "test":
        await send(connectionId, {
          message: `This response was pushed through Lambda by the user: ${body?.name}. To the user with connectionId: ${connectionId}`,
        });
        break;
      case "checkOverlayCookieId":
        console.log("JSON.stringify(body)");
        console.log(JSON.stringify(body));
        console.log("body");
        console.log(body);
        if (body?.overlayIdCookieKey) {
          console.log(
            "INSIDE THE IF STATEMENT with condition: (body?.overlayIdCookieKey)"
          );
          const overlayIdCookieKey = body?.overlayIdCookieKey;
          const params = {
            TableName: tableName,
            Key: { id: overlayIdCookieKey },
          };
          try {
            console.log("INSIDE THE TRY");
            /*             await docClient
              .get(params, (err, data) => {
                if (err) {
                  console.log("return err");
                  return err;
                } else {
                  console.log("return data");
                  return data;
                }
              })
              .promise()
              .then((data) => {
                console.log("hello in here", data);
              }); */
            await docClient
              .get(params, (err, data) => {
                if (err) {
                  return err;
                } else {
                  return data;
                }
              })
              .promise()
              .then(async (data) => {
                console.log("data from docClient.get");
                console.log(data);
                // If id does not exist in overlayCookieIdTable
                if (Object.keys(data).length <= 0) {
                  await docClient
                    .put(
                      {
                        TableName: tableName,
                        Item: {
                          id: connectionId,
                          name: connectionId,
                        },
                      },
                      (err, data) => {
                        if (err) {
                          return err;
                        } else {
                          return data;
                        }
                      }
                    )
                    .promise()
                    .then((data) => {
                      console.log("data from docClient.put");
                      console.log(data);
                      send(connectionId, {
                        newOverlayIdCookieKey: connectionId,
                      });
                    })
                    .catch((err) => {
                      send(connectionId, {
                        error: err,
                      });
                    });
                } else {
                  send(connectionId, {
                    message: "overlayCookieId exists in db",
                  });
                }
              })
              .catch((err) => {
                console.log("error from docClient.get");
                console.log(err);
                send(connectionId, {
                  message: { message: "in the catch", error: errorInGet },
                });
              });
          } catch (err) {
            console.log(err);
          }
        }
        break;
      case "sendToAllUsers":
        break;

      default:
        break;
    }
  }
  const response = {
    isBase64Encoded: false,
    statusCode: 200,
    body: "",
  };

  return response;

  // Creates a new item, or replaces an old item with a new item
  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#put-property

  // const msg = `Connection successful, your connectionId: ${connectionId} has been added to the database`;

  // await send(msg);
};
