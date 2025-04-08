import { S3Client } from "@aws-sdk/client-s3";

const awsConfig = {
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
  },
  region: import.meta.env.VITE_AWS_REGION,
};

export const s3Client = new S3Client(awsConfig);
export const bucketName = import.meta.env.VITE_AWS_S3_BUCKET;
