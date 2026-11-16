import { readFile, unlink } from "node:fs/promises";
import path from "node:path";
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

export type StoredObject = {
  key: string;
  url: string;
  storage: "s3" | "local";
};

type ObjectStorageConfig = {
  bucket: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  endpoint?: string;
  publicBaseUrl: string;
  forcePathStyle: boolean;
};

function firstEnv(...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return undefined;
}

function stripTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function resolveConfig(): ObjectStorageConfig | null {
  const bucket = firstEnv("S3_BUCKET", "BUCKET_NAME", "R2_BUCKET");
  const accessKeyId = firstEnv(
    "S3_ACCESS_KEY_ID",
    "AWS_ACCESS_KEY_ID",
    "R2_ACCESS_KEY_ID",
  );
  const secretAccessKey = firstEnv(
    "S3_SECRET_ACCESS_KEY",
    "AWS_SECRET_ACCESS_KEY",
    "R2_SECRET_ACCESS_KEY",
  );

  if (!bucket || !accessKeyId || !secretAccessKey) {
    return null;
  }

  const region =
    firstEnv("S3_REGION", "AWS_REGION", "AWS_SES_REGION", "R2_REGION") ??
    "us-east-1";
  const endpoint = firstEnv("S3_ENDPOINT", "AWS_ENDPOINT_URL", "R2_ENDPOINT");
  const publicBaseUrl = firstEnv(
    "S3_PUBLIC_URL",
    "BUCKET_PUBLIC_URL",
    "R2_PUBLIC_URL",
  );

  const resolvedPublicBase = publicBaseUrl
    ? stripTrailingSlash(publicBaseUrl)
    : endpoint
      ? null
      : `https://${bucket}.s3.${region}.amazonaws.com`;

  if (!resolvedPublicBase) {
    console.warn(
      "Object storage credentials are set but S3_PUBLIC_URL (or BUCKET_PUBLIC_URL / R2_PUBLIC_URL) is missing; falling back to local uploads.",
    );
    return null;
  }

  return {
    bucket,
    region,
    accessKeyId,
    secretAccessKey,
    endpoint,
    publicBaseUrl: resolvedPublicBase,
    forcePathStyle: Boolean(endpoint),
  };
}

let cachedClient: S3Client | null | undefined;
let cachedConfig: ObjectStorageConfig | null | undefined;

function getStorage() {
  if (cachedConfig === undefined) {
    cachedConfig = resolveConfig();
    cachedClient = cachedConfig
      ? new S3Client({
          region: cachedConfig.region,
          endpoint: cachedConfig.endpoint,
          forcePathStyle: cachedConfig.forcePathStyle,
          credentials: {
            accessKeyId: cachedConfig.accessKeyId,
            secretAccessKey: cachedConfig.secretAccessKey,
          },
        })
      : null;
  }
  return { config: cachedConfig, client: cachedClient };
}

export function isObjectStorageEnabled() {
  return getStorage().config !== null;
}

export function publicUrlForKey(key: string) {
  const { config } = getStorage();
  if (!config) {
    return `/uploads/${key.replace(/^\/+/, "")}`;
  }
  return `${config.publicBaseUrl}/${key.replace(/^\/+/, "")}`;
}

export async function storeUploadedFile(options: {
  localPath: string;
  key: string;
  contentType: string;
  localPublicUrl: string;
}): Promise<StoredObject> {
  const { config, client } = getStorage();
  if (!config || !client) {
    return {
      key: options.key,
      url: options.localPublicUrl,
      storage: "local",
    };
  }

  const body = await readFile(options.localPath);
  await client.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: options.key,
      Body: body,
      ContentType: options.contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
  await unlink(options.localPath).catch(() => {
    // Temp file may already be removed.
  });

  return {
    key: options.key,
    url: `${config.publicBaseUrl}/${options.key}`,
    storage: "s3",
  };
}

export async function deleteStoredObject(options: {
  key?: string;
  publicUrl?: string | null;
  localPrefix?: string;
  localDir?: string;
}) {
  const { config, client } = getStorage();
  const url = options.publicUrl ?? null;

  if (url && options.localPrefix && options.localDir) {
    if (url.startsWith(options.localPrefix)) {
      const filename = url.slice(options.localPrefix.length);
      if (
        filename &&
        !filename.includes("/") &&
        !filename.includes("\\") &&
        !filename.includes("..")
      ) {
        await unlink(path.join(options.localDir, filename)).catch(() => {
          // Ignore missing legacy files.
        });
      }
      return;
    }
  }

  let key = options.key;
  if (!key && url && config) {
    const prefix = `${config.publicBaseUrl}/`;
    if (url.startsWith(prefix)) {
      key = url.slice(prefix.length);
    }
  }

  if (!key || !config || !client) {
    return;
  }

  if (key.includes("..")) {
    return;
  }

  await client
    .send(
      new DeleteObjectCommand({
        Bucket: config.bucket,
        Key: key,
      }),
    )
    .catch(() => {
      // Ignore missing remote objects.
    });
}
