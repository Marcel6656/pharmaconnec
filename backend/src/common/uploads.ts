import { BadRequestException, RequestMethod } from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import { mkdirSync, readFileSync, unlinkSync } from 'fs';
import { diskStorage } from 'multer';
import { join, resolve } from 'path';

export const UPLOAD_ROOT = resolve(
  process.env.UPLOAD_DIR || (process.env.VERCEL ? '/tmp/uploads' : './uploads'),
);
/** Images de produits et couvertures autorisées individuellement par le serveur */
export const PUBLIC_UPLOAD_DIR = join(UPLOAD_ROOT, 'public');
/** Justificatifs administratifs : jamais exposés statiquement */
export const PRIVATE_UPLOAD_DIR = join(UPLOAD_ROOT, 'private');

mkdirSync(PUBLIC_UPLOAD_DIR, { recursive: true });
mkdirSync(PRIVATE_UPLOAD_DIR, { recursive: true });

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'application/pdf': '.pdf',
  'text/plain': '.txt',
  'text/csv': '.csv',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
};

export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const DOC_TYPES = [
  ...IMAGE_TYPES,
  'application/pdf',
  'text/plain',
  'text/csv',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const randomName = (mimetype: string) =>
  `${Date.now()}-${randomBytes(8).toString('hex')}${MIME_TO_EXT[mimetype] || '.bin'}`;

function isLikelyPlainText(buf: Buffer): boolean {
  if (buf.length === 0) return false;
  const sample = buf.subarray(0, Math.min(buf.length, 4096));
  for (let i = 0; i < sample.length; i++) {
    const b = sample[i];
    if (b === 0) return false;
  }
  const head = sample.toString('utf8').trimStart().toLowerCase();
  if (head.startsWith('<!doctype') || head.startsWith('<html') || head.startsWith('<svg') || head.startsWith('<script')) {
    return false;
  }
  return true;
}

function detectMagicMime(filePath: string, declaredMime?: string): string | null {
  try {
    const buf = readFileSync(filePath);
    if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
    if (buf.length >= 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47 && buf[4] === 0x0d && buf[5] === 0x0a && buf[6] === 0x1a && buf[7] === 0x0a) {
      return 'image/png';
    }
    if (buf.length >= 12 && buf.subarray(0, 4).toString('ascii') === 'RIFF' && buf.subarray(8, 12).toString('ascii') === 'WEBP') {
      return 'image/webp';
    }
    if (buf.length >= 6 && (buf.subarray(0, 6).toString('ascii') === 'GIF87a' || buf.subarray(0, 6).toString('ascii') === 'GIF89a')) {
      return 'image/gif';
    }
    if (buf.length >= 5 && buf.subarray(0, 5).toString('ascii') === '%PDF-') return 'application/pdf';
    // Fichiers Office OpenXML (.docx / .xlsx sont des archives ZIP PK\x03\x04)
    if (buf.length >= 4 && buf[0] === 0x50 && buf[1] === 0x4b && buf[2] === 0x03 && buf[3] === 0x04) {
      if (declaredMime === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') return declaredMime;
      if (declaredMime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return declaredMime;
    }
    if ((declaredMime === 'text/plain' || declaredMime === 'text/csv') && isLikelyPlainText(buf)) {
      return declaredMime;
    }
    return null;
  } catch {
    return null;
  }
}

export function readFileBufferAndHash(filePath: string): { buffer: Buffer; sha256: string } {
  const buffer = readFileSync(filePath);
  const sha256 = createHash('sha256').update(buffer).digest('hex');
  return { buffer, sha256 };
}

export function cleanupUploadedFiles(files?: Array<Express.Multer.File | undefined | null>) {
  if (!files) return;
  for (const file of files) {
    if (!file?.path) continue;
    try {
      unlinkSync(file.path);
    } catch { }
  }
}

export function assertSafeUploadedFiles(files: Express.Multer.File[], allowedMimes: string[]) {
  for (const file of files) {
    const detected = detectMagicMime(file.path, file.mimetype);
    if (!detected || !allowedMimes.includes(detected)) {
      cleanupUploadedFiles(files);
      throw new BadRequestException('Contenu du fichier invalide ou non autorisé (signature binaire rejetée).');
    }
    file.mimetype = detected;
  }
}

export function isSafeImageReference(value?: string | null): boolean {
  if (!value) return true;
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (trimmed.includes('..')) return false;
  if (trimmed.startsWith('/uploads/public/') || trimmed.startsWith('/images/')) return true;
  if (/^https:\/\/[^\s]+$/i.test(trimmed)) return true;
  if (/^data:image\/(jpeg|jpg|png|webp|gif);base64,[A-Za-z0-9+/=]+$/i.test(trimmed)) return true;
  return false;
}

export const imageUploadOptions = {
  storage: diskStorage({ destination: PUBLIC_UPLOAD_DIR, filename: (_req, file, cb) => cb(null, randomName(file.mimetype)) }),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req: unknown, file: Express.Multer.File, cb: (e: Error | null, ok: boolean) => void) =>
    IMAGE_TYPES.includes(file.mimetype) ? cb(null, true) : cb(new BadRequestException('Image JPEG, PNG, WEBP ou GIF uniquement (2 Mo max).'), false),
};

export const documentUploadOptions = {
  storage: diskStorage({ destination: PRIVATE_UPLOAD_DIR, filename: (_req, file, cb) => cb(null, randomName(file.mimetype)) }),
  limits: { fileSize: 5 * 1024 * 1024, files: 10 },
  fileFilter: (_req: unknown, file: Express.Multer.File, cb: (e: Error | null, ok: boolean) => void) =>
    DOC_TYPES.includes(file.mimetype) ? cb(null, true) : cb(new BadRequestException('Justificatifs PDF, DOCX, XLSX, CSV, TXT ou images (JPG/PNG/WEBP/GIF) uniquement (5 Mo max).'), false),
};

export const UPLOADED_IMAGE_PATH = 'uploads/public';
export const uploadedImageRoute = { path: `${UPLOADED_IMAGE_PATH}/:filename`, method: RequestMethod.ALL };
const uploadedImagePrefix = `/${UPLOADED_IMAGE_PATH}/`;
export const publicUrl = (storedName: string) => `${uploadedImagePrefix}${storedName}`;

export function isManagedImageReference(value?: string | null) {
  return Boolean(value?.trim().startsWith(uploadedImagePrefix));
}
