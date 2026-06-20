import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingLeft: 35,
    paddingRight: 35,
    fontSize: 8.5,
    fontFamily: 'Helvetica',
    lineHeight: 1.1,
    color: '#333',
  },
  logo: {
    width: 120,
    marginBottom: 8,
    alignSelf: 'center',
  },
  header: {
    marginBottom: 10,
    textAlign: 'center',
  },
  title: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 1,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 10,
    marginBottom: 3,
  },
  section: {
    marginBottom: 4,
  },
  paragraph: {
    marginBottom: 1.5,
  },
  bold: {
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 10,
    borderTop: 1,
    borderColor: '#eee',
    paddingTop: 5,
  },
  signatureBox: {
    marginTop: 5,
    padding: 6,
    backgroundColor: '#f9f9f9',
    border: 1,
    borderColor: '#eee',
  },
  checkboxSection: {
    marginTop: 5,
    padding: 5,
    border: 1,
    borderColor: '#eee',
    fontSize: 7.5,
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

  // Split content by double newlines to identify paragraphs, 
  // then single newlines for lines within paragraphs
  const paragraphs = content.split('\n\n').filter(p => p.trim());

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Image src={logoSrc} style={styles.logo} />
        
        <View style={styles.header}>
          <Text style={styles.title}>Tax Preparation Engagement Agreement</Text>
          <Text style={styles.subtitle}>Tax Year {year}</Text>
        </View>

        {paragraphs.map((para, i) => (
          <View key={i} style={styles.section}>
            {para.split('\n').filter(line => line.trim()).map((line, j) => (
              <Text key={j} style={styles.paragraph}>{line.trim()}</Text>
            ))}
          </View>
        ))}

        <View wrap={false} style={{ marginTop: 5 }}>
          <View style={styles.checkboxSection}>
            <Text>[X] I have read and agree to the terms of this Engagement Agreement and authorize Your Tax Source to prepare and electronically file my tax return.</Text>
            <Text style={{ marginTop: 2 }}>[X] I consent to electronic delivery of documents.</Text>
            <Text style={{ marginTop: 2 }}>[X] I understand I am responsible for reviewing my completed return before filing.</Text>
          </View>

          <View style={styles.signatureBox}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 5 }}>
              <Text style={styles.bold}>Electronic Signature:</Text>
              <Text style={{ fontSize: 16, fontFamily: 'Helvetica', fontStyle: 'italic', color: '#1a1a1a' }}>{signatureData}</Text>
            </View>
            <View style={{ marginTop: 2 }}>
              <Text style={{ color: '#666', fontSize: 8 }}>
                <Text style={styles.bold}>Signed By:</Text> {clientName}
              </Text>
              <Text style={{ color: '#666', fontSize: 8, marginTop: 1 }}>
                <Text style={styles.bold}>Date Signed:</Text> {signedAt.toLocaleString('en-US', { 
                  month: '2-digit', 
                  day: '2-digit', 
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text style={{ textAlign: 'center', color: '#999', fontSize: 7 }}>
            Jennifer Simpson, EA | Owner, Your Tax Source | Belmont, NC
          </Text>
          <Text style={{ textAlign: 'center', color: '#999', fontSize: 7, marginTop: 1 }}>
            Securely signed via Your Tax Source Portal
          </Text>
        </View>
      </Page>
    </Document>
  );
};
