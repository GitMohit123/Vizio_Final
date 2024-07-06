import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const dynamoDBClient = new DynamoDBClient({
  region: "ap-south-1",
  credentials: {
    accessKeyId: "AKIA6GBMH26TF2GXMLPT",
    secretAccessKey: "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",
  },
});

export default dynamoDBClient;