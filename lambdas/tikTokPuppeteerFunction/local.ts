import * as lambdaLocal from "lambda-local";

const jsonPayload = {
  key: 1,
};

lambdaLocal
  .execute({
    event: jsonPayload,
    lambdaPath: "./index.ts",
    timeoutMs: 999999,
  })
  .then((done) => {
    console.log(done);
  })
  .catch((err) => {
    console.error(err);
  });
