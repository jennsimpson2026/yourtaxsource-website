import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontSize: 11,
    fontFamily: 'Helvetica',
    lineHeight: 1.5,
  },
  header: {
    marginBottom: 30,
    borderBottom: 1,
    paddingBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    color: '#666',
    marginBottom: 10,
  },
  section: {
    marginBottom: 15,
  },
  bold: {
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 50,
    borderTop: 1,
    paddingTop: 20,
  },
  signatureBox: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f9f9f9',
    border: 1,
    borderColor: '#eee',
  },
});

interface EngagementLetterPDFProps {
  clientName: string;
  signedAt: Date;
  signatureData: string;
  content: string;
  year: number;
}

export const EngagementLetterPDF = ({
  clientName,
  signedAt,
  signatureData,
  content,
  year
}: EngagementLetterPDFProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Tax Source</Text>
        <Text style={styles.subtitle}>Individual Income Tax Engagement Letter - Tax Year {year}</Text>
      </View>

      <View style={styles.section}>
        <Text>Date: {signedAt.toLocaleDateString()}</Text>
      </View>

      <View style={styles.section}>
        <Text>{content}</Text>
      </View>

      <View style={styles.signatureBox}>
        <Text style={styles.bold}>Electronic Signature:</Text>
        <Text style={{ fontSize: 20, marginTop: 10, fontStyle: 'italic' }}>{signatureData}</Text>
        <Text style={{ marginTop: 5, color: '#666' }}>
          Signed by: {clientName} on {signedAt.toLocaleString()}
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={{ textAlign: 'center', color: '#999', fontSize: 9 }}>
          This document was electronically signed and is legally binding.
          Your Tax Source | Belmont, NC
        </Text>
      </View>
    </Page>
  </Document>
);
