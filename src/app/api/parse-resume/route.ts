import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 30;

// ---------------------------------------------------------------------------
// Polyfill browser-only APIs that pdfjs-dist (used by pdf-parse) requires
// when running in a Node.js server context (Next.js API route).
// ---------------------------------------------------------------------------
if (typeof (globalThis as any).DOMMatrix === 'undefined') {
  (globalThis as any).DOMMatrix = class DOMMatrix {
    a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
    m11 = 1; m12 = 0; m13 = 0; m14 = 0;
    m21 = 0; m22 = 1; m23 = 0; m24 = 0;
    m31 = 0; m32 = 0; m33 = 1; m34 = 0;
    m41 = 0; m42 = 0; m43 = 0; m44 = 1;
    is2D = true;
    isIdentity = true;
    constructor(_init?: string | number[]) {}
    static fromFloat32Array(_a: Float32Array) { return new (globalThis as any).DOMMatrix(); }
    static fromFloat64Array(_a: Float64Array) { return new (globalThis as any).DOMMatrix(); }
    static fromMatrix(_o?: unknown) { return new (globalThis as any).DOMMatrix(); }
    multiply(_o?: unknown) { return this; }
    translate(_tx = 0, _ty = 0, _tz = 0) { return this; }
    scale(_s = 1, _ox = 0, _oy = 0) { return this; }
    rotate(_a = 0, _ox = 0, _oy = 0) { return this; }
    inverse() { return this; }
    transformPoint(_p?: unknown) { return { x: 0, y: 0, z: 0, w: 1 }; }
    toFloat32Array() { return new Float32Array(16); }
    toFloat64Array() { return new Float64Array(16); }
    toString() { return 'matrix(1, 0, 0, 1, 0, 0)'; }
  };
}

if (typeof (globalThis as any).Path2D === 'undefined') {
  (globalThis as any).Path2D = class Path2D {
    constructor(_d?: string | Path2D) {}
    addPath(_p: unknown, _t?: unknown) {}
    closePath() {}
    moveTo(_x: number, _y: number) {}
    lineTo(_x: number, _y: number) {}
    bezierCurveTo(_cp1x: number, _cp1y: number, _cp2x: number, _cp2y: number, _x: number, _y: number) {}
    quadraticCurveTo(_cpx: number, _cpy: number, _x: number, _y: number) {}
    arc(_x: number, _y: number, _r: number, _sa: number, _ea: number, _ac?: boolean) {}
    arcTo(_x1: number, _y1: number, _x2: number, _y2: number, _r: number) {}
    ellipse(_x: number, _y: number, _rx: number, _ry: number, _rot: number, _sa: number, _ea: number, _ac?: boolean) {}
    rect(_x: number, _y: number, _w: number, _h: number) {}
  };
}

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
