import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 30, paddingBottom: 60, fontSize: 10, fontFamily: 'Helvetica' },
  section: { marginBottom: 15 },
  header: { fontSize: 18, marginBottom: 20, textAlign: 'center', fontWeight: 'bold', color: '#0f172a' },
  stageHeader: { fontSize: 12, marginTop: 10, marginBottom: 5, fontWeight: 'bold', backgroundColor: '#f3f4f6', padding: 5, color: '#374151' },
  table: { display: 'flex', width: '100%', borderStyle: 'solid', borderWidth: 1, borderColor: '#e5e7eb' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#e5e7eb', minHeight: 25, alignItems: 'center' },
  // Summary columns
  colSumStage: { width: '40%', padding: 5, borderRightWidth: 1, borderColor: '#e5e7eb' },
  colSumPending: { width: '20%', padding: 5, borderRightWidth: 1, borderColor: '#e5e7eb', textAlign: 'center' },
  colSumResponsible: { width: '40%', padding: 5 },
  // Detailed columns
  colDetTicket: { width: '15%', padding: 5, borderRightWidth: 1, borderColor: '#e5e7eb' },
  colDetCompany: { width: '25%', padding: 5, borderRightWidth: 1, borderColor: '#e5e7eb' },
  colDetClient: { width: '20%', padding: 5, borderRightWidth: 1, borderColor: '#e5e7eb' },
  colDetDetails: { width: '30%', padding: 5, borderRightWidth: 1, borderColor: '#e5e7eb' },
  colDetDelay: { width: '10%', padding: 5, textAlign: 'center' },
  
  tableCellHeader: { fontSize: 10, fontWeight: 'bold', color: '#ffffff' },
  tableCell: { fontSize: 9, color: '#1f2937' },
  bgHeader: { backgroundColor: '#1e293b' },
  pageNumber: { position: 'absolute', fontSize: 10, bottom: 30, left: 0, right: 0, textAlign: 'center', color: '#9ca3af' }
});

export const ReportDocument = ({ summaryData, detailedData }) => {
  // Group detailedData by stage
  const groupedDetailedData = detailedData.reduce((acc, curr) => {
    if (!acc[curr.stage]) acc[curr.stage] = [];
    acc[curr.stage].push(curr);
    return acc;
  }, {});

  const getHeaders = () => {
    return ["Ticket ID", "Company Name", "Client Name", "Details", "Delay (Days)"];
  };

  const getColStyles = () => {
    return [
      styles.colDetTicket,
      styles.colDetCompany,
      styles.colDetClient,
      styles.colDetDetails,
      styles.colDetDelay
    ];
  };

  const getRowData = (row) => {
    return [
      row.ticketId || "-",
      row.companyName || "-",
      row.clientName || "-",
      row.details || "-",
      String(row.delay !== undefined && row.delay !== null ? row.delay : "0")
    ];
  };

  return (
    <Document>
      {/* Summary Page */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Summary Report (Service-Support)</Text>
        <View style={styles.section}>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.bgHeader]} fixed>
              <View style={styles.colSumStage}><Text style={styles.tableCellHeader}>Stages</Text></View>
              <View style={styles.colSumPending}><Text style={styles.tableCellHeader}>Overdue Pending</Text></View>
              <View style={styles.colSumResponsible}><Text style={styles.tableCellHeader}>Responsible</Text></View>
            </View>
            {summaryData.map((row, i) => (
              <View style={styles.tableRow} key={i} wrap={false}>
                <View style={styles.colSumStage}><Text style={styles.tableCell}>{String(row.stage)}</Text></View>
                <View style={styles.colSumPending}>
                  <Text style={styles.tableCell}>
                    {String(row.pending)}
                  </Text>
                </View>
                <View style={styles.colSumResponsible}><Text style={styles.tableCell}>{String(row.responsible)}</Text></View>
              </View>
            ))}
          </View>
        </View>
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (`Page ${pageNumber} of ${totalPages}`)} fixed />
      </Page>

      {/* Detailed Report Pages */}
      {Object.entries(groupedDetailedData).map(([stageName, itemsArray], idx) => {
        let items = itemsArray;
        
        const heads = getHeaders();
        const colStyles = getColStyles();
        
        let headerText = `Detailed Report: ${String(stageName)} (${String(items.length)} Overdue)`;

        return (
          <Page key={idx} size="A4" style={styles.page}>
            <Text style={styles.header}>{headerText}</Text>
            
            <View style={styles.section}>
              <View style={styles.table}>
                {/* Column Headers */}
                <View style={[styles.tableRow, styles.bgHeader]} fixed >
                  {heads.map((head, i) => (
                    <View key={i} style={[colStyles[i], { padding: 5, borderRightWidth: 1, borderColor: '#e5e7eb' }]} >
                      <Text style={styles.tableCellHeader}>{head}</Text>
                    </View>
                  ))}
                </View>

                {items.map((row, i) => {
                  const data = getRowData(row);
                  return (
                    <View style={styles.tableRow} key={i} wrap={false}>
                      {data.map((cell, j) => (
                        <View key={j} style={[colStyles[j], { padding: 5, borderRightWidth: 1, borderColor: '#e5e7eb' }]} >
                          <Text style={styles.tableCell}>{String(cell || "-")}</Text>
                        </View>
                      ))}
                    </View>
                  );
                })}
              </View>
            </View>
            <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (`Page ${pageNumber} of ${totalPages}`)} fixed />
          </Page>
        );
      })}
    </Document>
  );
};
