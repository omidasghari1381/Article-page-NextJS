import { promises as fs } from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

export class UploadsService {
  imageMimeOk(mimetype: string) {
    return /^image\/(jpg|jpeg|png|gif|webp|bmp|svg\+xml)$/.test(mimetype);
  }

  private getUploadDir(): string {
    const now = new Date();
    const y = now.getUTCFullYear();
    const m = String(now.getUTCMonth() + 1).padStart(2, '0');
    return path.join(process.cwd(), 'public', 'uploads', 'articles', String(y), m);
  }

  private toPublicUrl(absPath: string): string {
    const rel = absPath
      .replace(process.cwd(), '')
      .replace(path.join(path.sep, 'public'), '')
      .replace(/\\/g, '/');
    return '/' + rel.replace(/^\/+/, '');
  }

  async saveSingleImage(file: File): Promise<{ url: string; filename: string; diskPath: string }> {
    if (!this.imageMimeOk(file.type)) {
      throw new Error('only image is allowed');
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadDir = this.getUploadDir();
    await fs.mkdir(uploadDir, { recursive: true });

    const original = (file.name || '').toLowerCase();
    const ext = original.includes('.') ? '.' + original.split('.').pop() : '';
    const name = `${Date.now()}-${randomUUID()}${ext}`;

    const diskPath = path.join(uploadDir, name);
    await fs.writeFile(diskPath, buffer, { flag: 'w' });

    const url = this.toPublicUrl(diskPath);
    return { url, filename: name, diskPath };
  }

  async deleteFiles(input: string | string[]): Promise<void> {
    const list = Array.isArray(input) ? input : [input];

    for (const p of list) {
      const rel = p.startsWith('/uploads/')
        ? p
        : path.posix.join('/uploads/articles', p.replace(/^\/+/, ''));

      const abs = path.join(process.cwd(), 'public', rel);
      try {
        await fs.unlink(abs);
      } catch (e: any) {
        if (e?.code !== 'ENOENT') {
          console.warn('deleteFiles error:', e);
        }
      }
    }
  }
}