exports.handler = async (event) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify("Testing Lambda GitHub actions!"),
  };
  return response;
};
