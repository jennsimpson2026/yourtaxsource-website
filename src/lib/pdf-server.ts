import { renderToBuffer } from '@react-pdf/renderer';
import { EngagementLetterPDF } from '@/components/pdf/EngagementLetterPDF';
import React from 'react';
import fs from 'fs/promises';
import path from 'path';

export async function generateEngagementLetterPDF(props: {
  clientName: string;
  signedAt: Date;
  signatureData: string;
  content: string;
  year: number;
}) {
  let logoData: string | undefined;
  try {
    const logoPath = path.join(process.cwd(), 'public', 'images', 'logo-long.png');
    const buffer = await fs.readFile(logoPath);
    logoData = `data:image/png;base64,${buffer.toString('base64')}`;
  } catch (error) {
    console.warn("Failed to load logo for PDF:", error);
  }

  return await renderToBuffer(
    React.createElement(EngagementLetterPDF, { ...props, logoData } as any) as any
  );
}
