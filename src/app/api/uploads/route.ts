import { NextResponse } from 'next/server';
import { UploadsService } from '@/server/modules/uploads/services/uploads.service';

const uploadsService = new UploadsService();

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ message: 'No file uploaded (field: "file")' }, { status: 400 });
    }

    const saved = await uploadsService.saveSingleImage(file);
    return NextResponse.json(
      { status: 200, data: { url: saved.url, filename: saved.filename } },
      { status: 200 }
    );
  } catch (err: any) {
    console.error(err);
    const message = err?.message || 'Upload failed';
    return NextResponse.json({ message }, { status: 500 });
  }
}