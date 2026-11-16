import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import path from "node:path";
import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import { storeUploadedFile } from "../object-storage.js";

export const CMS_MEDIA_DIR = path.join(process.cwd(), "uploads", "cms");
export const CMS_MEDIA_PUBLIC_PREFIX = "/uploads/cms/";
export const MAX_CMS_MEDIA_BYTES = 5 * 1024 * 1024;

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

mkdirSync(CMS_MEDIA_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    mkdirSync(CMS_MEDIA_DIR, { recursive: true });
    cb(null, CMS_MEDIA_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = MIME_TO_EXT[file.mimetype] ?? "";
    cb(null, `${randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_CMS_MEDIA_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (MIME_TO_EXT[file.mimetype]) {
      cb(null, true);
      return;
    }
    cb(new Error("INVALID_CMS_MEDIA_TYPE"));
  },
});

export function parseCmsMediaUpload(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  upload.single("file")(req, res, (err: unknown) => {
    if (!err) {
      next();
      return;
    }
    if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
      res.status(400).json({ error: "Image must be 5MB or smaller." });
      return;
    }
    if (err instanceof Error && err.message === "INVALID_CMS_MEDIA_TYPE") {
      res.status(400).json({ error: "Use a JPEG, PNG, or WebP image." });
      return;
    }
    console.error("CMS media upload failed:", err);
    res.status(400).json({ error: "Unable to upload that image." });
  });
}

export function cmsMediaPublicUrl(filename: string) {
  return `${CMS_MEDIA_PUBLIC_PREFIX}${filename}`;
}

export function cmsMediaObjectKey(filename: string) {
  return `cms/${filename}`;
}

export async function persistCmsMediaUpload(file: Express.Multer.File) {
  return storeUploadedFile({
    localPath: file.path,
    key: cmsMediaObjectKey(file.filename),
    contentType: file.mimetype,
    localPublicUrl: cmsMediaPublicUrl(file.filename),
  });
}
