// Create clients and set shared const values outside of the handler.

// Get the DynamoDB table name from environment variables
const tableName = process.env.SAMPLE_TABLE;

// Create a DocumentClient that represents the query to add an item
const dynamodb = require("aws-sdk/clients/dynamodb");
const docClient = new dynamodb.DocumentClient();

/**
 * A simple example includes a HTTP get method to get one item by id from a DynamoDB table.
 */
exports.simpleMessage = async (event) => {
  console.log(JSON.stringify(event, 2));
  const { send } = getSocketContext(event);

  await send(
    JSON.stringify({ message: "This response was pushed from my Lambda." })
  );
  return {
    isBase64Encoded: false,
    statusCode: 200,
    body: "",
  };
};
