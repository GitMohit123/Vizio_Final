import { S3Client } from "@aws-sdk/client-s3";

export const s3Client = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: "AKIA6GBMH26TF2GXMLPT",
    secretAccessKey: "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",
  },
});

