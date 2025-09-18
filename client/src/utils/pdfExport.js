import jsPDF from 'jspdf';

export const generateLoanPDF = (loan) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(11, 21, 64); // Navy color
  doc.text('P2P Lending Platform', 20, 30);
  
  doc.setFontSize(16);
  doc.setTextColor(15, 181, 166); // Teal color
  doc.text('Loan Summary Report', 20, 45);
  
  // Loan Details
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  
  const yStart = 65;
  let yPos = yStart;
  
  // Basic Information
  doc.setFontSize(14);
  doc.text('Loan Information', 20, yPos);
  yPos += 15;
  
  doc.setFontSize(10);
  doc.text(`Loan ID: ${loan.id}`, 20, yPos);
  yPos += 8;
  doc.text(`Status: ${loan.status}`, 20, yPos);
  yPos += 8;
  doc.text(`Created: ${new Date(loan.createdAt).toLocaleDateString()}`, 20, yPos);
  yPos += 8;
  
  if (loan.disbursedAt) {
    doc.text(`Disbursed: ${new Date(loan.disbursedAt).toLocaleDateString()}`, 20, yPos);
    yPos += 8;
  }
  
  if (loan.dueAt) {
    doc.text(`Due Date: ${new Date(loan.dueAt).toLocaleDateString()}`, 20, yPos);
    yPos += 8;
  }
  
  yPos += 10;
  
  // Participants
  doc.setFontSize(14);
  doc.text('Participants', 20, yPos);
  yPos += 15;
  
  doc.setFontSize(10);
  doc.text(`Lender: ${loan.lenderId?.name || 'N/A'}`, 20, yPos);
  yPos += 8;
  doc.text(`Borrower: ${loan.borrowerId?.name || 'N/A'}`, 20, yPos);
  yPos += 15;
  
  // Financial Summary
  doc.setFontSize(14);
  doc.text('Financial Summary', 20, yPos);
  yPos += 15;
  
  doc.setFontSize(10);
  doc.text(`Principal Amount: ₹${loan.principal.toLocaleString()}`, 20, yPos);
  yPos += 8;
  doc.text(`Platform Fee: ₹${loan.initialPlatformFee.toLocaleString()}`, 20, yPos);
  yPos += 8;
  doc.text(`Outstanding: ₹${loan.outstanding.toLocaleString()}`, 20, yPos);
  yPos += 8;
  doc.text(`Total Paid: ₹${loan.totalPaymentsMade.toLocaleString()}`, 20, yPos);
  yPos += 8;
  doc.text(`Fees Paid: ₹${loan.totalFeesPaid.toLocaleString()}`, 20, yPos);
  yPos += 15;
  
  // Payment Schedule
  if (loan.blockSchedule && loan.blockSchedule.length > 0) {
    doc.setFontSize(14);
    doc.text('Payment Schedule', 20, yPos);
    yPos += 15;
    
    doc.setFontSize(10);
    loan.blockSchedule.forEach((block, index) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.text(`Block ${block.blockNumber}: ${new Date(block.startDate).toLocaleDateString()} - ${new Date(block.endDate).toLocaleDateString()}`, 20, yPos);
      yPos += 8;
      
      if (block.isMainGrace) {
        doc.text('(Main Grace Period)', 30, yPos);
        yPos += 8;
      }
    });
  }
  
  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Generated on ${new Date().toLocaleString()}`, 20, doc.internal.pageSize.height - 10);
    doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 40, doc.internal.pageSize.height - 10);
  }
  
  return doc;
};

export const downloadLoanPDF = (loan) => {
  const doc = generateLoanPDF(loan);
  doc.save(`loan-${loan.id}-summary.pdf`);
};

// Generate No-Overdue Certificate (NOC)
export const generateLoanNOCPDF = (loan) => {
  const doc = new jsPDF();

  // Header Branding
  doc.setFontSize(18);
  doc.setTextColor(11, 21, 64);
  doc.text('Lend & Borrow', 20, 25);

  doc.setFontSize(14);
  doc.setTextColor(15, 181, 166);
  doc.text('No-Overdue Certificate (NOC)', 20, 35);

  // Body
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);

  const line = (y) => doc.line(20, y, 190, y);

  let y = 48;
  line(y);
  y += 10;

  const lenderName = loan?.lender?.name || loan?.lenderId || '—';
  const borrowerName = loan?.borrower?.name || loan?.borrowerId || '—';
  const created = loan?.createdAt ? new Date(loan.createdAt).toLocaleDateString() : '—';
  const disbursed = loan?.disbursedAt ? new Date(loan.disbursedAt).toLocaleDateString() : '—';
  const completed = loan?.completedAt ? new Date(loan.completedAt).toLocaleDateString() : new Date().toLocaleDateString();

  const para = [
    `This is to certify that Loan ID ${loan?.id || '—'} between Lender ${lenderName} and Borrower ${borrowerName} has been fully repaid.`,
    `As of ${completed}, there are no outstanding dues, penalties, or overdues against this loan.`,
    `This certificate is electronically generated and does not require a physical signature.`,
  ];

  para.forEach((p) => {
    const split = doc.splitTextToSize(p, 170);
    doc.text(split, 20, y);
    y += split.length * 6 + 6;
  });

  y += 4;
  doc.setFontSize(12);
  doc.text('Loan Summary', 20, y);
  y += 8;
  doc.setFontSize(10);
  doc.text(`Loan ID: ${loan?.id || '—'}`, 20, y); y += 6;
  doc.text(`Status: ${loan?.status || '—'}`, 20, y); y += 6;
  doc.text(`Created: ${created}`, 20, y); y += 6;
  if (disbursed !== '—') { doc.text(`Disbursed: ${disbursed}`, 20, y); y += 6; }
  doc.text(`Principal: ₹${(loan?.principal ?? 0).toLocaleString()}`, 20, y); y += 6;
  doc.text(`Total Paid: ₹${(loan?.totalPaymentsMade ?? 0).toLocaleString()}`, 20, y); y += 6;
  doc.text(`Outstanding: ₹${(loan?.outstanding ?? 0).toLocaleString()}`, 20, y); y += 10;

  line(y);
  y += 10;
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on ${new Date().toLocaleString()}`, 20, y);
  doc.text('Electronic Certificate - No signature required', 20, y + 6);

  return doc;
};

export const downloadLoanNOCPDF = (loan) => {
  const doc = generateLoanNOCPDF(loan);
  doc.save(`loan-${loan?.id || 'noc'}.noc.pdf`);
};







