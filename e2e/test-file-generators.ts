import JSZip from 'jszip';

/**
 * Creates a minimal valid PDF file
 * This creates a simple text-based PDF that can be parsed by pdf-parse
 */
export function createMinimalPDF(content: string): Buffer {
  // Create a minimal PDF structure
  // This is a very basic PDF that pdf-parse can read
  const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/Resources <<
/Font <<
/F1 <<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
>>
>>
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj
4 0 obj
<<
/Length ${content.length + 50}
>>
stream
BT
/F1 12 Tf
50 750 Td
(${content.replace(/[()\\]/g, '\\$&')}) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000015 00000 n 
0000000068 00000 n 
0000000125 00000 n 
0000000324 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
${425 + content.length}
%%EOF`;

  return Buffer.from(pdfContent, 'utf-8');
}

/**
 * Creates a minimal valid DOCX file
 * DOCX is a ZIP archive containing XML files
 */
export async function createMinimalDOCX(content: string): Promise<Buffer> {
  const zip = new JSZip();

  // [Content_Types].xml - Required
  zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`);

  // _rels/.rels - Required
  zip.folder('_rels')?.file('.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`);

  // word/document.xml - Main document content
  const escapedContent = content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

  zip.folder('word')?.file('document.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r>
        <w:t>${escapedContent}</w:t>
      </w:r>
    </w:p>
  </w:body>
</w:document>`);

  // Generate the ZIP file
  const buffer = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });

  return buffer;
}

/**
 * Creates a corrupted/invalid PDF for testing error handling
 */
export function createCorruptedPDF(): Buffer {
  return Buffer.from('%PDF-1.4\nThis is not a valid PDF file\n%%EOF');
}

/**
 * Creates a corrupted/invalid DOCX for testing error handling
 */
export function createCorruptedDOCX(): Buffer {
  return Buffer.from('PK\x03\x04This is not a valid DOCX file');
}
