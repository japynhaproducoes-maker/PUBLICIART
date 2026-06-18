/**
 * Storage de assets (S3 / R2 / MinIO / Spaces).
 *
 * Hoje: upload direto via multipart, repassa o buffer ao S3 e devolve URL
 * pública. Para uploads grandes, usar presigned URLs (TODO: expor endpoint).
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { config } from "../config.js";

let client: S3Client | null = null;

function getClient(): S3Client {
  if (!client) {
    client = new S3Client({
      region: config.s3.region,
      endpoint: config.s3.endpoint || undefined,
      forcePathStyle: Boolean(config.s3.endpoint),
      credentials:
        config.s3.accessKeyId && config.s3.secretAccessKey
          ? { accessKeyId: config.s3.accessKeyId, secretAccessKey: config.s3.secretAccessKey }
          : undefined,
    });
  }
  return client;
}

export async function uploadObject(key: string, body: Buffer, contentType: string): Promise<string> {
  if (!config.s3.bucket) throw new Error("S3 bucket não configurado.");
  await getClient().send(
    new PutObjectCommand({
      Bucket: config.s3.bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
  const base = config.s3.publicUrl || (config.s3.endpoint ? `${config.s3.endpoint}/${config.s3.bucket}` : "");
  return base ? `${base}/${key}` : key;
}

export async function deleteObject(key: string): Promise<void> {
  if (!config.s3.bucket) return;
  await getClient().send(new DeleteObjectCommand({ Bucket: config.s3.bucket, Key: key }));
}
