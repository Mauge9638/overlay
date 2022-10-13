const aws = require("aws-sdk");

exports.testHandler = async (event) => {
  console.log(JSON.stringify(event, 2));

  // const { connectionId, send } = getSocketContext(event);

  // await send(
  //   JSON.stringify({
  //     message: `This response was pushed from my Lambda. To the user with connectionId: ${connectionId}`,
  //   })
  // );

  return {
    isBase64Encoded: false,
    statusCode: 200,
    body: JSON.stringify({
      message: `This response was pushed from my Lambda. To the user with connectionId: testId1234`,
    }),
  };
};

const getSocketContext = (event) => {
  // console.log(event);
  // const { domainName, stage, connectionId } = event.requestContext;
  // const endpoint = `${domainName}/${stage}/test`;
  // const apigwManagementApi = new aws.ApiGatewayManagementApi({
  //   apiVersion: "2018-11-29",
  //   endpoint,
  // });
  // const send = async (data) => {
  //   await apigwManagementApi
  //     .postToConnection({ ConnectionId: connectionId, Data: data })
  //     .promise();
  // };
  // return { connectionId, endpoint, send };
};
