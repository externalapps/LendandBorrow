/**
 * Mock CIBIL Service
 * 
 * This service provides dummy CIBIL data for demonstration purposes.
 * No actual connection to any real CIBIL or credit reporting system.
 */

// Generate a random date in the past few months
const getRandomPastDate = (maxMonthsAgo = 6) => {
  const now = new Date();
  const monthsAgo = Math.floor(Math.random() * maxMonthsAgo) + 1;
  const daysAgo = Math.floor(Math.random() * 30);
  const date = new Date(now);
  date.setMonth(now.getMonth() - monthsAgo);
  date.setDate(now.getDate() - daysAgo);
  return date;
};

// Generate a random loan ID
const generateLoanId = () => {
  return Math.random().toString(36).substring(2, 10) + '-' + 
         Math.random().toString(36).substring(2, 6) + '-' + 
         Math.random().toString(36).substring(2, 6);
};

// Generate a random CIBIL reference ID
const generateCibilReferenceId = () => {
  return 'CIBIL-' + Math.random().toString(36).toUpperCase().substring(2, 10);
};

// Generate a random amount between min and max
const getRandomAmount = (min = 1000, max = 50000) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Generate a random status with weighted probabilities
const getRandomStatus = () => {
  const rand = Math.random();
  if (rand < 0.6) return 'REPORTED';
  if (rand < 0.9) return 'RESOLVED';
  return 'PENDING';
};

// Generate a random block number
const getRandomBlockNumber = () => {
  return Math.floor(Math.random() * 4) + 1;
};

// Generate a single mock CIBIL report
const generateMockReport = (index, userId) => {
  const reportedAt = getRandomPastDate();
  const status = getRandomStatus();
  const resolvedAt = status === 'RESOLVED' ? new Date(reportedAt.getTime() + (Math.random() * 30 * 24 * 60 * 60 * 1000)) : null;
  
  return {
    id: `report-${userId.substring(0, 4)}-${index}`,
    loanId: { id: generateLoanId() },
    borrowerId: userId,
    blockNumber: getRandomBlockNumber(),
    amountReported: getRandomAmount(),
    reportedAt: reportedAt,
    status: status,
    resolvedAt: resolvedAt,
    cibilReferenceId: generateCibilReferenceId(),
    reason: 'Missed minimum payment',
    description: 'Failed to make required payment by block end date'
  };
};

// Generate a set of mock CIBIL reports for a user
const generateMockReportsForUser = (userId) => {
  // Generate a random number of reports (0-5)
  const numReports = Math.floor(Math.random() * 6);
  
  // For user_001, always generate at least 2 reports
  const reportsCount = userId === 'user_001' ? Math.max(numReports, 2) : numReports;
  
  const reports = [];
  for (let i = 0; i < reportsCount; i++) {
    reports.push(generateMockReport(i, userId));
  }
  
  // Sort by reported date, newest first
  return reports.sort((a, b) => new Date(b.reportedAt) - new Date(a.reportedAt));
};

// Get mock CIBIL reports for a user
export const getMockCibilReports = (userId) => {
  return generateMockReportsForUser(userId);
};

// Get mock CIBIL summary for a user
export const getMockCibilSummary = (userId) => {
  const reports = generateMockReportsForUser(userId);
  
  return {
    totalReports: reports.length,
    activeReports: reports.filter(r => r.status === 'REPORTED').length,
    resolvedReports: reports.filter(r => r.status === 'RESOLVED').length,
    lastReportDate: reports.length > 0 ? reports[0].reportedAt : null
  };
};

export default {
  getMockCibilReports,
  getMockCibilSummary
};














