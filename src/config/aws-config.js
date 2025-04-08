import AWS from "aws-sdk";

// Configure AWS SDK with credentials
const configureAWS = () => {
  AWS.config.update({
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
    region: import.meta.env.VITE_AWS_REGION,
    s3ForcePathStyle: true,
    signatureVersion: "v4",
  });

  // Log configuration for debugging
  console.log("AWS SDK initialized with region:", AWS.config.region);
  console.log("AWS credentials loaded:", !!AWS.config.credentials);

  return AWS;
};

export default configureAWS;
