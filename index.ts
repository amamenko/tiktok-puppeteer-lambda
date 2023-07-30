import { Context, APIGatewayProxyCallback } from "aws-lambda";

export const handler = async (
  event: any,
  context: Context,
  callback: APIGatewayProxyCallback
) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify("Testing Lambda GitHub actions TypeScript!"),
  };
  return response;
};
