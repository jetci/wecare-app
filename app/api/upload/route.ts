import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Disable default body parsing to handle multipart/form-data
export const config = { api: { bodyParser: false } };

// Directory under public to store uploads
const uploadDir = path.join(process.cwd(), 'public', 'uploads');

export async function POST(req: NextRequest) {
  try {
    await fs.promises.mkdir(uploadDir, { recursive: true });
    // Parse multipart form data via Web API
    const formData = await req.formData();
    const fileField = formData.get('file');
    if (!(fileField instanceof File) || !fileField.name) {
      return NextResponse.json({ url: null });
    }
    // Read file bytes and save
    const buffer = Buffer.from(
      typeof fileField.arrayBuffer === 'function'
        ? await fileField.arrayBuffer()
        : await new Response(fileField).arrayBuffer()
    );
    const filename = `${Date.now()}_${fileField.name}`;
    const filepath = path.join(uploadDir, filename);
    await fs.promises.writeFile(filepath, buffer);
    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (err) {
    console.error('Upload failed:', err);
    return NextResponse.json({ url: null, error: 'Upload failed' }, { status: 500 });
  }
}
