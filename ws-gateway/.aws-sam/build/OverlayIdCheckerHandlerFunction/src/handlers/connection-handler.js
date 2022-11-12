const aws = require("aws-sdk");
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
    } catch (error) {
      console.log("Error in send: ", err);
    }
  };

  return { connectionId, endpoint, send, routeKey };
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

exports.connectionHandler = async (event) => {
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
      case "$connect":
        const response = {
          isBase64Encoded: false,
          statusCode: 200,
          body: "",
        };

        return response;
      case "$disconnect":
        try {
          return scanConnectionsTable(
            "currentConnectionId = :currentConnectionId",
            { ":currentConnectionId": connectionId }
          ).then((data) => {
            const id = data?.Items[0]?.id;
            return updateConnectionsTable(
              id,
              "set currentlyConnected = :currentlyConnected, currentConnectionId = :currentConnectionId",
              {
                ":currentConnectionId": "",
                ":currentlyConnected": false,
              }
            ).then(() => {
              const response = {
                isBase64Encoded: false,
                statusCode: 200,
                body: "",
              };

              return response;
            });
          });
        } catch (error) {
          const response = {
            isBase64Encoded: false,
            statusCode: 400,
            body: ("An error occured", error),
          };

          return response;
        }
      case "sendToAllUsers":
        break;

      default:
        break;
    }
  }

  // Creates a new item, or replaces an old item with a new item
  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#put-property

  // const msg = `Connection successful, your connectionId: ${connectionId} has been added to the database`;

  // await send(msg);
};
