import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: "AKIA3CMCCDJWBG3JQ43S",
    secretAccessKey: "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",
  },
});

export const generateSignedUrl = async (s3Url, fileName) => {
  // Extract the object key from the S3 URL
  const key = s3Url.split("/").pop();
  const params = {
    Bucket: "socio-scan1",
    Key: key,
    ResponseContentDisposition: `inline; filename="${fileName}"`,
  };
  const command = new GetObjectCommand(params);
  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
};
