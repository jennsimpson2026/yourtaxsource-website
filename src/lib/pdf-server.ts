import { renderToBuffer } from '@react-pdf/renderer';
import { EngagementLetterPDF } from '@/components/pdf/EngagementLetterPDF';
import React from 'react';

export async function generateEngagementLetterPDF(props: {
  clientName: string;
  signedAt: Date;
  signatureData: string;
  content: string;
  year: number;
}) {
  return await renderToBuffer(React.createElement(EngagementLetterPDF, props));
}
