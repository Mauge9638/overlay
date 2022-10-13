const aws = require("aws-sdk");
const dynamodb = require("aws-sdk/clients/dynamodb");
const docClient = new dynamodb.DocumentClient();
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

exports.connectionHandler = async (event) => {
  console.log(JSON.stringify(event, 2));

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

    console.log(routeKey);
    switch (routeKey) {
      case "$connect":
        // var params = {
        //   TableName: tableName,
        //   Item: { id: "abcd1234", name: connectionId },
        // };

        // await docClient.put(params).promise();
        break;
      case "test":
        await send(connectionId, {
          message: `This response was pushed through Lambda by the user: ${body?.name}. To the user with connectionId: ${connectionId}`,
        });
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
