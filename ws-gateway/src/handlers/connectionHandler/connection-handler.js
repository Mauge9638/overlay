const aws = require("aws-sdk");
const docClient = new aws.DynamoDB.DocumentClient();
const connectionsTable = process.env.CONNECTIONS_TABLE;

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
      TableName: connectionsTable,
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
      TableName: connectionsTable,
      FilterExpression: FilterExpression,
      ExpressionAttributeValues: ExpressionAttributeValues,
    })
    .promise();
};

exports.connectionHandler = async (event) => {
  if (event.requestContext) {
    const { routeKey } = getSocketContext(event);
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
      case "$connect": {
        const response = {
          isBase64Encoded: false,
          statusCode: 200,
          body: "",
        };

        return response;
      }
      // Not used due to $disconnect being a "best effort operation", therefor it's not reliable and therefor not trustworthy
      case "$disconnect":
        break;
    }
  }
};
