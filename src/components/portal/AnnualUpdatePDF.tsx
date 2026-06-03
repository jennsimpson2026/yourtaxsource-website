import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#1f2937',
  },
  header: {
    marginBottom: 25,
    borderBottomWidth: 2,
    borderBottomColor: '#6b21a8',
    paddingBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  headerLeft: {
    flexDirection: 'column',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6b21a8',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 4,
    color: '#4b5563',
    fontWeight: 'bold',
  },
  confidential: {
    fontSize: 8,
    color: '#ef4444',
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    backgroundColor: '#f9fafb',
    padding: 6,
    marginBottom: 8,
    textTransform: 'uppercase',
    borderLeftWidth: 3,
    borderLeftColor: '#6b21a8',
    color: '#374151',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    width: '50%',
    marginBottom: 8,
    paddingRight: 10,
  },
  fullWidthItem: {
    width: '100%',
    marginBottom: 8,
  },
  label: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#6b7280',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 10,
    color: '#111827',
  },
  table: {
    marginTop: 5,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#f3f4f6',
    padding: 4,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#f3f4f6',
    padding: 4,
  },
  col1: { width: '40%' },
  col2: { width: '30%' },
  col3: { width: '30%' },
  signatureSection: {
    marginTop: 40,
    padding: 15,
    backgroundColor: '#fdfcfe',
    borderWidth: 1,
    borderColor: '#f3e8ff',
    borderRadius: 4,
  },
  signatureLine: {
    fontSize: 16,
    fontFamily: 'Times-Italic',
    color: '#111827',
    marginBottom: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#9ca3af',
    borderTopWidth: 0.5,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
  }
});

interface AnnualUpdatePDFProps {
  data: any;
  taxYear: number;
}

export const AnnualUpdatePDF = ({ data, taxYear }: AnnualUpdatePDFProps) => (
  <Document author="Your Tax Source" title={`${data.lastName} - ${taxYear} Annual Update`}>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Your Tax Source</Text>
          <Text style={styles.subtitle}>{taxYear} Tax Questionnaire Summary</Text>
        </View>
        <Text style={styles.confidential}>Confidential Taxpayer Information</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Client Information</Text>
        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <Text style={styles.label}>First Name</Text>
            <Text style={styles.value}>{data.firstName}</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Last Name</Text>
            <Text style={styles.value}>{data.lastName}</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>SSN (Last 4)</Text>
            <Text style={styles.value}>{data.ssnLast4}</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Filing Status</Text>
            <Text style={styles.value}>{data.filingStatus}</Text>
          </View>
          <View style={styles.fullWidthItem}>
            <Text style={styles.label}>Address</Text>
            <Text style={styles.value}>{data.address}</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>City</Text>
            <Text style={styles.value}>{data.city}</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={{ ...styles.label, width: '30%' }}>State</Text>
            <Text style={{ ...styles.label, width: '70%' }}>Zip Code</Text>
            <View style={{ flexDirection: 'row' }}>
              <Text style={{ ...styles.value, width: '30%' }}>{data.state}</Text>
              <Text style={{ ...styles.value, width: '70%' }}>{data.zip}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. Dependents</Text>
        {data.dependents && data.dependents.length > 0 ? (
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.col1}>Full Name</Text>
              <Text style={styles.col2}>SSN</Text>
              <Text style={styles.col3}>Relationship</Text>
            </View>
            {data.dependents.map((dep: any, i: number) => (
              <View key={i} style={styles.tableRow}>
                <Text style={styles.col1}>{dep.name}</Text>
                <Text style={styles.col2}>{dep.ssn}</Text>
                <Text style={styles.col3}>{dep.relationship}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={{ ...styles.value, fontStyle: 'italic', color: '#9ca3af' }}>No dependents reported.</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3. Banking Information</Text>
        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Bank Name</Text>
            <Text style={styles.value}>{data.bankName}</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Account Type</Text>
            <Text style={styles.value}>{data.accountType}</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Routing Number</Text>
            <Text style={styles.value}>{data.routingNumber}</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Account Number</Text>
            <Text style={styles.value}>{data.accountNumber}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>4. Tax Questionnaire Details</Text>
        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Bought/Sold/Refinanced Home?</Text>
            <Text style={{ ...styles.value, color: data.boughtSoldHome ? '#b91c1c' : '#111827', fontWeight: data.boughtSoldHome ? 'bold' : 'normal' }}>
              {data.boughtSoldHome ? 'YES' : 'NO'}
            </Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Started/Sold/Closed Business?</Text>
            <Text style={{ ...styles.value, color: data.startedBusiness ? '#b91c1c' : '#111827', fontWeight: data.startedBusiness ? 'bold' : 'normal' }}>
              {data.startedBusiness ? 'YES' : 'NO'}
            </Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Virtual Currency (Crypto)?</Text>
            <Text style={{ ...styles.value, color: data.receivedCrypto ? '#b91c1c' : '#111827', fontWeight: data.receivedCrypto ? 'bold' : 'normal' }}>
              {data.receivedCrypto ? 'YES' : 'NO'}
            </Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Foreign Bank Accounts/Assets?</Text>
            <Text style={{ ...styles.value, color: data.foreignAccounts ? '#b91c1c' : '#111827', fontWeight: data.foreignAccounts ? 'bold' : 'normal' }}>
              {data.foreignAccounts ? 'YES' : 'NO'}
            </Text>
          </View>
          <View style={{ ...styles.fullWidthItem, marginTop: 5 }}>
            <Text style={styles.label}>Major Life Changes / Additional Notes</Text>
            <Text style={{ ...styles.value, lineHeight: 1.4 }}>{data.majorLifeChanges || 'No additional notes provided.'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.signatureSection}>
        <Text style={styles.label}>Electronic Signature</Text>
        <Text style={styles.signatureLine}>{data.signature}</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 0.5, borderTopColor: '#e5e7eb', paddingTop: 5 }}>
          <Text style={{ fontSize: 8, color: '#6b7280' }}>Digitally Signed by Taxpayer</Text>
          <Text style={{ fontSize: 8, color: '#6b7280' }}>Date: {data.date}</Text>
        </View>
      </View>

      <Text style={styles.footer}>
        This document contains sensitive personal information and is intended solely for tax preparation by Your Tax Source.
      </Text>
    </Page>
  </Document>
);
