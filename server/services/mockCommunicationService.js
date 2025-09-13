const { v4: uuidv4 } = require('uuid');

class MockCommunicationService {
  constructor() {
    this.smsHistory = [];
    this.callHistory = [];
    this.emailHistory = [];
  }

  // Mock SMS Service
  async sendSMS(phoneNumber, message, loanId = null) {
    const smsId = uuidv4();
    const smsRecord = {
      id: smsId,
      phoneNumber,
      message,
      loanId,
      status: 'delivered',
      sentAt: new Date(),
      cost: 0.50,
      provider: 'Mock SMS Provider',
      deliveryTime: new Date(Date.now() + Math.random() * 5000) // Random delivery time within 5 seconds
    };

    this.smsHistory.push(smsRecord);
    
    console.log(`📱 Mock SMS Sent: ${phoneNumber} - "${message}"`);
    
    return {
      success: true,
      messageId: smsId,
      status: 'delivered',
      cost: 0.50,
      deliveryTime: smsRecord.deliveryTime
    };
  }

  // Mock VoIP Call Service
  async makeVoIPCall(phoneNumber, borrowerName, loanId, outstanding, minPayment, excuseEndDate) {
    const callId = uuidv4();
    const duration = Math.floor(Math.random() * 120) + 30; // 30-150 seconds
    const callStatus = Math.random() > 0.2 ? 'completed' : 'no_answer'; // 80% success rate
    
    const callRecord = {
      id: callId,
      phoneNumber,
      borrowerName,
      loanId,
      outstanding,
      minPayment,
      excuseEndDate,
      status: callStatus,
      duration: callStatus === 'completed' ? duration : 0,
      startedAt: new Date(),
      endedAt: new Date(Date.now() + (callStatus === 'completed' ? duration * 1000 : 0)),
      cost: callStatus === 'completed' ? 2.00 : 0.50,
      provider: 'Mock VoIP Provider',
      transcript: callStatus === 'completed' ? this.generateMockTranscript(borrowerName, outstanding, minPayment) : null
    };

    this.callHistory.push(callRecord);
    
    console.log(`📞 Mock VoIP Call: ${phoneNumber} (${borrowerName}) - Status: ${callStatus}, Duration: ${duration}s`);
    
    return {
      success: true,
      callId,
      status: callStatus,
      duration: callStatus === 'completed' ? duration : 0,
      cost: callRecord.cost,
      transcript: callRecord.transcript
    };
  }

  // Mock Email Service
  async sendEmail(email, subject, message, loanId = null) {
    const emailId = uuidv4();
    const emailRecord = {
      id: emailId,
      email,
      subject,
      message,
      loanId,
      status: 'sent',
      sentAt: new Date(),
      cost: 0.10,
      provider: 'Mock Email Provider'
    };

    this.emailHistory.push(emailRecord);
    
    console.log(`📧 Mock Email Sent: ${email} - "${subject}"`);
    
    return {
      success: true,
      messageId: emailId,
      status: 'sent',
      cost: 0.10
    };
  }

  // Generate mock call transcript
  generateMockTranscript(borrowerName, outstanding, minPayment) {
    const templates = [
      `Call with ${borrowerName}: Discussed outstanding amount of ₹${outstanding}. Borrower agreed to pay minimum ₹${minPayment} by due date.`,
      `Call with ${borrowerName}: Payment reminder sent. Borrower acknowledged the debt and promised to make payment soon.`,
      `Call with ${borrowerName}: Discussed payment options. Borrower requested extension but was informed of consequences.`,
      `Call with ${borrowerName}: Friendly reminder about ₹${outstanding} outstanding. Borrower was cooperative and agreed to pay.`
    ];
    
    return templates[Math.floor(Math.random() * templates.length)];
  }

  // Get communication history
  getCommunicationHistory(loanId) {
    return {
      sms: this.smsHistory.filter(sms => !loanId || sms.loanId === loanId),
      calls: this.callHistory.filter(call => !loanId || call.loanId === loanId),
      emails: this.emailHistory.filter(email => !loanId || email.loanId === loanId)
    };
  }

  // Get all communication history
  getAllCommunicationHistory() {
    return {
      sms: this.smsHistory,
      calls: this.callHistory,
      emails: this.emailHistory
    };
  }

  // Send overdue payment reminder
  async sendOverdueReminder(borrower, loan) {
    const message = `Payment overdue for loan #${loan.id}. Outstanding: ₹${loan.outstanding}. Please pay ₹${loan.minPayment} by ${new Date(loan.dueAt).toLocaleDateString()}. Contact: 1800-LEND-BORROW`;
    
    const results = await Promise.all([
      this.sendSMS(borrower.phone, message, loan.id),
      this.sendEmail(borrower.email, `Payment Overdue - Loan #${loan.id}`, message, loan.id)
    ]);

    return {
      sms: results[0],
      email: results[1]
    };
  }

  // Send payment confirmation
  async sendPaymentConfirmation(borrower, loan, paymentAmount) {
    const message = `Payment of ₹${paymentAmount} received for loan #${loan.id}. Outstanding balance: ₹${loan.outstanding - paymentAmount}. Thank you!`;
    
    const results = await Promise.all([
      this.sendSMS(borrower.phone, message, loan.id),
      this.sendEmail(borrower.email, `Payment Confirmed - Loan #${loan.id}`, message, loan.id)
    ]);

    return {
      sms: results[0],
      email: results[1]
    };
  }

  // Send loan disbursement notification
  async sendDisbursementNotification(borrower, loan) {
    const message = `Loan #${loan.id} of ₹${loan.principal} has been disbursed to your account. Repayment due: ${new Date(loan.dueAt).toLocaleDateString()}.`;
    
    const results = await Promise.all([
      this.sendSMS(borrower.phone, message, loan.id),
      this.sendEmail(borrower.email, `Loan Disbursed - Loan #${loan.id}`, message, loan.id)
    ]);

    return {
      sms: results[0],
      email: results[1]
    };
  }

  // Get service statistics
  getServiceStats() {
    return {
      totalSMS: this.smsHistory.length,
      totalCalls: this.callHistory.length,
      totalEmails: this.emailHistory.length,
      totalCost: this.smsHistory.reduce((sum, sms) => sum + sms.cost, 0) +
                 this.callHistory.reduce((sum, call) => sum + call.cost, 0) +
                 this.emailHistory.reduce((sum, email) => sum + email.cost, 0),
      successRate: {
        sms: (this.smsHistory.filter(sms => sms.status === 'delivered').length / this.smsHistory.length * 100).toFixed(1),
        calls: (this.callHistory.filter(call => call.status === 'completed').length / this.callHistory.length * 100).toFixed(1),
        emails: (this.emailHistory.filter(email => email.status === 'sent').length / this.emailHistory.length * 100).toFixed(1)
      }
    };
  }
}

// Create singleton instance
const mockCommunicationService = new MockCommunicationService();

module.exports = mockCommunicationService;
