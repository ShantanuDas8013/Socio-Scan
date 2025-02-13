import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: "ap-south-1", // updated region
  endpoint: "https://s3.ap-south-1.amazonaws.com", // specify the correct endpoint
  credentials: {
    accessKeyId: "AKIA3CMCCDJWLV2BUTV3",
    secretAccessKey: "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",
  },
});

export const uploadFile = async (file) => {
  const fileName = `${Date.now()}-${file.name}`;
  let body = file;

  if (typeof file.stream === "function") {
    let stream = file.stream();
    if (typeof stream.getReader !== "function") {
      console.log(
        "file.stream() did not return a proper stream. Falling back to Response(file).body..."
      );
      stream = new Response(file).body;
    }
    body = stream;
  } else {
    console.log("File doesn't support .stream(), converting to Uint8Array...");
    const arrayBuffer = await file.arrayBuffer();
    body = new Uint8Array(arrayBuffer);
  }

  const uploadParams = {
    Bucket: "socio-scan1",
    Key: fileName,
    Body: body,
    ContentType: file.type,
  };

  try {
    const parallelUpload = new Upload({
      client: s3Client,
      params: uploadParams,
    });
    await parallelUpload.done();
    return `https://socio-scan1.s3.ap-south-1.amazonaws.com/${fileName}`;
  } catch (error) {
    console.error("S3 Upload error:", error);
    throw error;
  }
};

// New function to delete file from S3 using its URL
export const deleteFile = async (fileUrl) => {
  // Parse the file key from the URL (assuming standard S3 URL format)
  const key = fileUrl.split("/").pop();
  const params = {
    Bucket: "socio-scan1",
    Key: key,
  };
  try {
    const command = new DeleteObjectCommand(params);
    await s3Client.send(command);
    console.log("File deleted from S3:", key);
  } catch (error) {
    console.error("S3 Delete error:", error);
    throw error;
  }
};

// Function to generate pre-signed URL
export const getPresignedUrl = async (bucketName, key) => {
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    // Generate URL that expires in 1 hour
    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });
    return signedUrl;
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    throw error;
  }
};
