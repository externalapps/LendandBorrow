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







