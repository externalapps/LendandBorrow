const { v4: uuidv4 } = require('uuid');

class MockCibilService {
  constructor() {
    this.reports = new Map(); // Store reports by userId
    this.scoreHistory = new Map(); // Store score history by userId
  }

  // Generate realistic CIBIL score based on user profile
  generateCibilScore(user, loanHistory = []) {
    let baseScore = 650; // Base score
    
    // Adjust based on user profile
    if (user.kycStatus === 'VERIFIED') baseScore += 50;
    if (user.phone && user.email) baseScore += 30;
    
    // Adjust based on loan history
    const activeLoans = loanHistory.filter(loan => loan.status === 'ACTIVE').length;
    const completedLoans = loanHistory.filter(loan => loan.status === 'COMPLETED').length;
    const defaultedLoans = loanHistory.filter(loan => loan.status === 'DEFAULTED').length;
    
    baseScore += completedLoans * 20; // Good payment history
    baseScore -= defaultedLoans * 100; // Defaults hurt score
    baseScore -= activeLoans * 10; // Multiple active loans reduce score
    
    // Add some randomness
    const randomFactor = Math.floor(Math.random() * 100) - 50;
    baseScore += randomFactor;
    
    // Keep score within realistic range
    return Math.max(300, Math.min(900, baseScore));
  }

  // Generate CIBIL grade based on score
  getCibilGrade(score) {
    if (score >= 800) return 'Excellent';
    if (score >= 750) return 'Very Good';
    if (score >= 700) return 'Good';
    if (score >= 650) return 'Fair';
    if (score >= 600) return 'Poor';
    return 'Very Poor';
  }

  // Generate credit factors
  generateCreditFactors(score, user, loanHistory) {
    const factors = [];
    
    // Payment History Factor
    const defaultedLoans = loanHistory.filter(loan => loan.status === 'DEFAULTED').length;
    if (defaultedLoans === 0) {
      factors.push({
        factor: 'Payment History',
        impact: 'Positive',
        description: 'No late payments or defaults',
        weight: 'High'
      });
    } else {
      factors.push({
        factor: 'Payment History',
        impact: 'Negative',
        description: `${defaultedLoans} defaulted loan(s)`,
        weight: 'High'
      });
    }
    
    // Credit Utilization Factor
    const activeLoans = loanHistory.filter(loan => loan.status === 'ACTIVE').length;
    if (activeLoans <= 2) {
      factors.push({
        factor: 'Credit Utilization',
        impact: 'Positive',
        description: 'Low credit utilization',
        weight: 'Medium'
      });
    } else {
      factors.push({
        factor: 'Credit Utilization',
        impact: 'Negative',
        description: 'High number of active loans',
        weight: 'Medium'
      });
    }
    
    // KYC Verification Factor
    if (user.kycStatus === 'VERIFIED') {
      factors.push({
        factor: 'Identity Verification',
        impact: 'Positive',
        description: 'KYC documents verified',
        weight: 'Medium'
      });
    } else {
      factors.push({
        factor: 'Identity Verification',
        impact: 'Negative',
        description: 'KYC verification pending',
        weight: 'Medium'
      });
    }
    
    // Credit Mix Factor
    const completedLoans = loanHistory.filter(loan => loan.status === 'COMPLETED').length;
    if (completedLoans > 0) {
      factors.push({
        factor: 'Credit Mix',
        impact: 'Positive',
        description: 'Diverse credit history',
        weight: 'Low'
      });
    } else {
      factors.push({
        factor: 'Credit Mix',
        impact: 'Neutral',
        description: 'Limited credit history',
        weight: 'Low'
      });
    }
    
    return factors;
  }

  // Generate score history
  generateScoreHistory(userId, currentScore) {
    const history = [];
    const months = 12; // Last 12 months
    
    for (let i = months; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      
      // Generate realistic score progression
      const baseScore = currentScore - (months - i) * 5; // Gradual improvement
      const randomChange = Math.floor(Math.random() * 20) - 10; // ±10 points
      const score = Math.max(300, Math.min(900, baseScore + randomChange));
      
      history.push({
        date: date.toISOString().split('T')[0],
        score: score,
        change: i === 0 ? 0 : score - (history[history.length - 1]?.score || score),
        reason: this.getScoreChangeReason(score, history[history.length - 1]?.score)
      });
    }
    
    return history;
  }

  // Get reason for score change
  getScoreChangeReason(currentScore, previousScore) {
    if (!previousScore) return 'Initial score';
    
    const change = currentScore - previousScore;
    if (change > 5) return 'Payment made on time';
    if (change > 0) return 'Credit utilization improved';
    if (change < -5) return 'Payment missed or delayed';
    if (change < 0) return 'Credit utilization increased';
    return 'No significant changes';
  }

  // Generate CIBIL report
  async generateCibilReport(userId, user, loanHistory = []) {
    const reportId = uuidv4();
    const currentScore = this.generateCibilScore(user, loanHistory);
    const grade = this.getCibilGrade(currentScore);
    const factors = this.generateCreditFactors(currentScore, user, loanHistory);
    const history = this.generateScoreHistory(userId, currentScore);
    
    const report = {
      id: reportId,
      userId: userId,
      score: currentScore,
      grade: grade,
      factors: factors,
      history: history,
      generatedAt: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      reportType: 'Full Report',
      provider: 'Mock CIBIL Service',
      summary: {
        totalAccounts: loanHistory.length,
        activeAccounts: loanHistory.filter(loan => loan.status === 'ACTIVE').length,
        closedAccounts: loanHistory.filter(loan => loan.status === 'COMPLETED').length,
        defaultedAccounts: loanHistory.filter(loan => loan.status === 'DEFAULTED').length,
        averageLoanAmount: loanHistory.length > 0 ? 
          loanHistory.reduce((sum, loan) => sum + loan.principal, 0) / loanHistory.length : 0
      }
    };
    
    // Store report
    this.reports.set(userId, report);
    this.scoreHistory.set(userId, history);
    
    console.log(`📊 Mock CIBIL Report Generated: User ${userId}, Score: ${currentScore}, Grade: ${grade}`);
    
    return report;
  }

  // Get CIBIL report for user
  async getCibilReport(userId) {
    return this.reports.get(userId) || null;
  }

  // Get score history for user
  async getScoreHistory(userId) {
    return this.scoreHistory.get(userId) || [];
  }

  // Update score based on loan activity
  async updateScore(userId, activity) {
    const currentReport = this.reports.get(userId);
    if (!currentReport) return null;
    
    let scoreChange = 0;
    let reason = '';
    
    switch (activity.type) {
      case 'PAYMENT_MADE':
        scoreChange = Math.floor(Math.random() * 10) + 5; // +5 to +15
        reason = 'On-time payment made';
        break;
      case 'PAYMENT_MISSED':
        scoreChange = -(Math.floor(Math.random() * 20) + 10); // -10 to -30
        reason = 'Payment missed or delayed';
        break;
      case 'LOAN_COMPLETED':
        scoreChange = Math.floor(Math.random() * 15) + 10; // +10 to +25
        reason = 'Loan successfully completed';
        break;
      case 'LOAN_DEFAULTED':
        scoreChange = -(Math.floor(Math.random() * 50) + 50); // -50 to -100
        reason = 'Loan defaulted';
        break;
      default:
        scoreChange = Math.floor(Math.random() * 6) - 3; // -3 to +3
        reason = 'Credit activity update';
    }
    
    const newScore = Math.max(300, Math.min(900, currentReport.score + scoreChange));
    const newGrade = this.getCibilGrade(newScore);
    
    // Update report
    currentReport.score = newScore;
    currentReport.grade = newGrade;
    currentReport.generatedAt = new Date();
    
    // Add to history
    const historyEntry = {
      date: new Date().toISOString().split('T')[0],
      score: newScore,
      change: scoreChange,
      reason: reason
    };
    
    const history = this.scoreHistory.get(userId) || [];
    history.push(historyEntry);
    
    // Keep only last 24 months
    if (history.length > 24) {
      history.splice(0, history.length - 24);
    }
    
    this.scoreHistory.set(userId, history);
    currentReport.history = history;
    
    console.log(`📈 Mock CIBIL Score Updated: User ${userId}, New Score: ${newScore} (${scoreChange > 0 ? '+' : ''}${scoreChange}), Reason: ${reason}`);
    
    return currentReport;
  }

  // Get all reports (for admin)
  getAllReports() {
    return Array.from(this.reports.values());
  }

  // Get service statistics
  getServiceStats() {
    const reports = Array.from(this.reports.values());
    const totalReports = reports.length;
    
    if (totalReports === 0) {
      return {
        totalReports: 0,
        averageScore: 0,
        scoreDistribution: {},
        gradeDistribution: {}
      };
    }
    
    const averageScore = reports.reduce((sum, report) => sum + report.score, 0) / totalReports;
    
    const scoreDistribution = {
      '300-499': reports.filter(r => r.score >= 300 && r.score < 500).length,
      '500-649': reports.filter(r => r.score >= 500 && r.score < 650).length,
      '650-749': reports.filter(r => r.score >= 650 && r.score < 750).length,
      '750-849': reports.filter(r => r.score >= 750 && r.score < 850).length,
      '850-900': reports.filter(r => r.score >= 850 && r.score <= 900).length
    };
    
    const gradeDistribution = reports.reduce((acc, report) => {
      acc[report.grade] = (acc[report.grade] || 0) + 1;
      return acc;
    }, {});
    
    return {
      totalReports,
      averageScore: Math.round(averageScore),
      scoreDistribution,
      gradeDistribution
    };
  }
}

// Create singleton instance
const mockCibilService = new MockCibilService();

module.exports = mockCibilService;






