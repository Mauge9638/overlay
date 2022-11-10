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
    } catch (error) {
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
        if (body?.overlayIdCookieKey) {
          const overlayIdCookieKey = body?.overlayIdCookieKey;
          console.log(
            "🚀 ~ file: overlay-id-checker-handler.js ~ line 62 ~ exports.overlayIdCheckerHandler= ~ overlayIdCookieKey",
            overlayIdCookieKey
          );
          const params = {
            TableName: tableName,
            Key: { id: overlayIdCookieKey },
          };
          try {
            await docClient
              .get(params)
              .promise()
              .then(async (dataInGet) => {
                console.log("dataInGet");
                console.log(dataInGet);
                await send(connectionId, {
                  message: { message: "in the then", data: dataInGet },
                });
              })
              .catch(async (errorInGet) => {
                console.log("errorInGet");
                console.log(errorInGet);
                await send(connectionId, {
                  message: { message: "in the catch", error: errorInGet },
                });
              });
          } catch (error) {
            console.log(error);
          }
        }
        await docClient
          .put({
            TableName: tableName,
            Item: {
              id: connectionId,
              name: connectionId,
            },
          })
          .promise();
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
