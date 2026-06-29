import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const region = process.env.AWS_REGION || "us-east-2";
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

if (!accessKeyId || !secretAccessKey) {
  console.warn("⚠️ AWS Credentials missing. S3 operations will fail in production.");
}

console.log(`S3 Config: Region=${region}, Bucket=${process.env.AWS_S3_BUCKET || "yourtaxsource-client-documents"}`);

export const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId: accessKeyId || "dummy",
    secretAccessKey: secretAccessKey || "dummy",
  },
});

export const BUCKET_NAME = process.env.AWS_S3_BUCKET || "yourtaxsource-client-documents";

export async function getPresignedUrl(key: string) {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });
  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

