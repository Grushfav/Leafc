import { randomUUID } from "node:crypto";
import { mkdirSync, unlink } from "node:fs";
import { readFile, unlink as unlinkAsync } from "node:fs/promises";
import path from "node:path";
import type { NextFunction, Request, Response } from "express";
import multer from "multer";

export const AVATARS_DIR = path.join(process.cwd(), "uploads", "avatars");
export const AVATAR_PUBLIC_PREFIX = "/uploads/avatars/";
export const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

mkdirSync(AVATARS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    mkdirSync(AVATARS_DIR, { recursive: true });
    cb(null, AVATARS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = MIME_TO_EXT[file.mimetype] ?? "";
    const userId = req.auth?.id ?? "anon";
    cb(null, `${userId}-${randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_AVATAR_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (MIME_TO_EXT[file.mimetype]) {
      cb(null, true);
      return;
    }
    cb(new Error("INVALID_AVATAR_TYPE"));
  },
});

export function parseAvatarUpload(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  upload.single("avatar")(req, res, (err: unknown) => {
    if (!err) {
      next();
      return;
    }
    if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
      res.status(400).json({ error: "Image must be 2MB or smaller." });
      return;
    }
    if (err instanceof Error && err.message === "INVALID_AVATAR_TYPE") {
      res.status(400).json({ error: "Use a JPEG, PNG, or WebP image." });
      return;
    }
    console.error("Avatar upload failed:", err);
    res.status(400).json({ error: "Unable to upload that image." });
  });
}

export function avatarPublicUrl(filename: string) {
  return `${AVATAR_PUBLIC_PREFIX}${filename}`;
}

export function removeStoredAvatar(avatarUrl: string | null | undefined) {
  if (!avatarUrl?.startsWith(AVATAR_PUBLIC_PREFIX)) return;
  const filename = avatarUrl.slice(AVATAR_PUBLIC_PREFIX.length);
  if (
    !filename ||
    filename.includes("/") ||
    filename.includes("\\") ||
    filename.includes("..")
  ) {
    return;
  }
  unlink(path.join(AVATARS_DIR, filename), () => {
    // Ignore missing files from earlier uploads.
  });
}

export async function isAllowedImageFile(
  filePath: string,
  mime: string,
): Promise<boolean> {
  const header = await readFile(filePath);
  if (header.length < 12) return false;
  if (mime === "image/jpeg") {
    return header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff;
  }
  if (mime === "image/png") {
    return (
      header[0] === 0x89 &&
      header[1] === 0x50 &&
      header[2] === 0x4e &&
      header[3] === 0x47
    );
  }
  if (mime === "image/webp") {
    return (
      header.toString("ascii", 0, 4) === "RIFF" &&
      header.toString("ascii", 8, 12) === "WEBP"
    );
  }
  return false;
}

export async function discardUploadedFile(filePath: string) {
  try {
    await unlinkAsync(filePath);
  } catch {
    // File may already be gone.
  }
}
