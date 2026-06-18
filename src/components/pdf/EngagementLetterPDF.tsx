import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontSize: 10,
    fontFamily: 'Helvetica',
    lineHeight: 1.4,
    color: '#333',
  },
  logo: {
    width: 200,
    marginBottom: 20,
    alignSelf: 'center',
  },
  header: {
    marginBottom: 30,
    textAlign: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 10,
  },
  section: {
    marginBottom: 12,
  },
  bold: {
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 40,
    borderTop: 1,
    borderColor: '#eee',
    paddingTop: 20,
  },
  signatureBox: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f9f9f9',
    border: 1,
    borderColor: '#eee',
  },
  checkboxSection: {
    marginTop: 15,
    padding: 10,
    border: 1,
    borderColor: '#eee',
    fontSize: 9,
  }
});

interface EngagementLetterPDFProps {
  clientName: string;
  signedAt: Date;
  signatureData: string;
  content: string;
  year: number;
  logoData?: string;
}

export const EngagementLetterPDF = ({
  clientName,
  signedAt,
  signatureData,
  content,
  year,
  logoData
}: EngagementLetterPDFProps) => {
  // Use provided logoData or fallback to a relative path
  const logoSrc = logoData || "/home/team/shared/repository/public/images/logo-long.png";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Image src={logoPath} style={styles.logo} />
        
        <View style={styles.header}>
          <Text style={styles.title}>Tax Preparation Engagement Agreement</Text>
          <Text style={styles.subtitle}>Tax Year {year}</Text>
        </View>

        <View style={styles.section}>
          <Text>{content}</Text>
        </View>

        <View style={styles.checkboxSection}>
          <Text>[X] I have read and agree to the terms of this Engagement Agreement and authorize Your Tax Source to prepare and electronically file my tax return.</Text>
          <Text style={{ marginTop: 4 }}>[X] I consent to electronic delivery of documents.</Text>
          <Text style={{ marginTop: 4 }}>[X] I understand I am responsible for reviewing my completed return before filing.</Text>
        </View>

        <View style={styles.signatureBox}>
          <Text style={styles.bold}>Electronic Signature:</Text>
          <Text style={{ fontSize: 18, marginTop: 8, fontStyle: 'italic', fontFamily: 'Times-Italic' }}>{signatureData}</Text>
          <Text style={{ marginTop: 8, color: '#666', fontSize: 9 }}>
            Signed by: {clientName}
          </Text>
          <Text style={{ marginTop: 2, color: '#666', fontSize: 9 }}>
            Date: {signedAt.toLocaleString()}
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={{ textAlign: 'center', color: '#999', fontSize: 8 }}>
            Jennifer Simpson, EA | Owner, Your Tax Source
          </Text>
          <Text style={{ textAlign: 'center', color: '#999', fontSize: 8, marginTop: 2 }}>
            Belmont, NC | Securely signed via Your Tax Source Portal
          </Text>
        </View>
      </Page>
    </Document>
  );
};
