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
  console.log(`[PDF_GEN] Starting generation for ${props.clientName}`);
  let logoData: string | undefined;
  try {
    const logoPath = path.join(process.cwd(), 'public', 'images', 'logo-long.png');
    console.log(`[PDF_GEN] Loading logo from: ${logoPath}`);
    const buffer = await fs.readFile(logoPath);
    logoData = `data:image/png;base64,${buffer.toString('base64')}`;
    console.log("[PDF_GEN] Logo loaded successfully");
  } catch (error) {
    console.warn("[PDF_GEN] Failed to load logo for PDF:", error);
  }

  try {
    console.log("[PDF_GEN] Rendering PDF to buffer...");
    const buffer = await renderToBuffer(
      React.createElement(EngagementLetterPDF, { ...props, logoData } as any) as any
    );
    console.log(`[PDF_GEN] Render successful, buffer size: ${buffer.length}`);
    return buffer;
  } catch (error) {
    console.error("[PDF_GEN] Error during renderToBuffer:", error);
    throw error;
  }
}
