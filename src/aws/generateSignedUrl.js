import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: import.meta.env.VITE_AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
  },
});

export const generateSignedUrl = async (s3Url, fileName) => {
  // Extract the object key from the S3 URL
  const key = s3Url.split("/").pop();
  const params = {
    Bucket: import.meta.env.VITE_AWS_S3_BUCKET || "socio-scan1",
    Key: key,
    ResponseContentDisposition: `inline; filename="${fileName}"`,
  };
  const command = new GetObjectCommand(params);
  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
};
