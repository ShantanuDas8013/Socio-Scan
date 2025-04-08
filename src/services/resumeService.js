import configureAWS from "../config/aws-config";

const AWS = configureAWS();
const s3 = new AWS.S3({
  signatureVersion: "v4",
  region: import.meta.env.VITE_AWS_REGION,
  credentials: new AWS.Credentials({
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
  }),
});

export const getResumeFromS3 = async (bucketName, key) => {
  try {
    console.log(`Attempting to access S3: ${bucketName}/${key}`);
    console.log(`Using region: ${import.meta.env.VITE_AWS_REGION}`);
    console.log(`Using access key: ${import.meta.env.VITE_AWS_ACCESS_KEY_ID}`);

    const params = {
      Bucket: bucketName,
      Key: key,
    };

    const data = await s3.getObject(params).promise();
    return data.Body;
  } catch (error) {
    console.error("Error fetching resume from S3:", error);
    throw error;
  }
};

export const scanResume = async (bucketName, key) => {
  try {
    const resumeData = await getResumeFromS3(bucketName, key);
    // Your resume scanning logic here
    // ...
    return { success: true, data: "Resume scanned successfully" };
  } catch (error) {
    console.error("Error scanning resume:", error);
    throw error;
  }
};
