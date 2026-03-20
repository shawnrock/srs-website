import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 30;

// POST /api/parse-resume
// Accepts multipart/form-data with a "file" field (PDF or DOCX)
// Returns { text: string }
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = file.name.toLowerCase();

    let text = '';

    if (fileName.endsWith('.pdf')) {
      // Dynamically require pdf-parse to avoid edge runtime issues
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdfModule = await import('pdf-parse') as any;
      const pdfParse = pdfModule.default ?? pdfModule;
      const result = await pdfParse(buffer);
      text = result.text;
    } else if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload a PDF or Word document (.docx).' },
        { status: 400 }
      );
    }

    // Clean up extracted text
    text = text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n{3,}/g, '\n\n')  // collapse excessive blank lines
      .trim();

    if (!text || text.length < 20) {
      return NextResponse.json(
        { error: 'Could not extract text from the file. The document may be image-based or protected.' },
        { status: 422 }
      );
    }

    return NextResponse.json({ text, charCount: text.length });
  } catch (err: any) {
    console.error('[parse-resume] Error:', err);
    return NextResponse.json({ error: `Failed to parse file: ${err.message}` }, { status: 500 });
  }
}
