const { v4: uuidv4 } = require('uuid');
const Communication = require('../models/Communication');

class MockServices {
  // Mock CIBIL reporting
  static async reportToCIBIL(loanId, borrowerId, amountReported, blockNumber) {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock CIBIL response
      const cibilResponse = {
        success: true,
        referenceId: `CIBIL_${loanId}_${blockNumber}_${Date.now()}`,
        reportedAt: new Date(),
        status: 'REPORTED',
        message: 'Successfully reported to CIBIL database'
      };

      console.log(`📊 Mock CIBIL Report: ${amountReported} for loan ${loanId}, block ${blockNumber}`);
      
      return cibilResponse;
    } catch (error) {
      console.error('Mock CIBIL reporting error:', error);
      throw error;
    }
  }

  // Mock VoIP call
  static async makeVoIPCall(loanId, borrowerPhone, borrowerName, outstanding, minPayment, blockEndDate) {
    try {
      const callId = uuidv4();
      
      // Generate call transcript
      const transcript = `Hello ${borrowerName}, this is PaySafe reminder. Your outstanding amount is ₹${outstanding}. Minimum payment due this block is ₹${minPayment}. If unpaid by ${blockEndDate.toLocaleDateString()}, your remaining outstanding may be reported to CIBIL. Please make payment at your earliest convenience. Thank you for using PaySafe.`;

      // Create communication record
      const communication = new Communication({
        id: callId,
        loanId,
        type: 'call',
        template: 'payment_reminder',
        transcript,
        sentAt: new Date(),
        status: 'DELIVERED',
        recipientPhone: borrowerPhone,
        metadata: {
          blockNumber: 1, // This would be calculated based on current block
          outstandingAmount: outstanding,
          minPayment,
          blockEndDate
        }
      });

      await communication.save();

      console.log(`📞 Mock VoIP Call made to ${borrowerPhone}: ${transcript}`);
      
      return {
        callId,
        transcript,
        status: 'DELIVERED',
        duration: Math.floor(Math.random() * 120) + 30 // 30-150 seconds
      };
    } catch (error) {
      console.error('Mock VoIP call error:', error);
      throw error;
    }
  }

  // Mock SMS
  static async sendSMS(loanId, borrowerPhone, borrowerName, outstanding, minPayment, blockEndDate) {
    try {
      const smsId = uuidv4();
      
      // Generate SMS content
      const message = `PaySafe: Hi ${borrowerName}, outstanding ₹${outstanding}, min due ₹${minPayment} by ${blockEndDate.toLocaleDateString()}. Pay now to avoid CIBIL reporting.`;

      // Create communication record
      const communication = new Communication({
        id: smsId,
        loanId,
        type: 'sms',
        template: 'payment_reminder_sms',
        transcript: message,
        sentAt: new Date(),
        status: 'DELIVERED',
        recipientPhone: borrowerPhone,
        metadata: {
          blockNumber: 1,
          outstandingAmount: outstanding,
          minPayment,
          blockEndDate
        }
      });

      await communication.save();

      console.log(`📱 Mock SMS sent to ${borrowerPhone}: ${message}`);
      
      return {
        smsId,
        message,
        status: 'DELIVERED'
      };
    } catch (error) {
      console.error('Mock SMS error:', error);
      throw error;
    }
  }

  // Mock email
  static async sendEmail(loanId, borrowerEmail, borrowerName, outstanding, minPayment, blockEndDate) {
    try {
      const emailId = uuidv4();
      
      // Generate email content
      const subject = 'PaySafe Payment Reminder';
      const body = `
Dear ${borrowerName},

This is a payment reminder from PaySafe.

Loan Details:
- Outstanding Amount: ₹${outstanding}
- Minimum Payment Due: ₹${minPayment}
- Due Date: ${blockEndDate.toLocaleDateString()}

Please make your payment before the due date to avoid any impact on your credit score.

If you have already made the payment, please ignore this message.

Best regards,
PaySafe Team
      `;

      // Create communication record
      const communication = new Communication({
        id: emailId,
        loanId,
        type: 'email',
        template: 'payment_reminder_email',
        transcript: body,
        sentAt: new Date(),
        status: 'DELIVERED',
        recipientEmail: borrowerEmail,
        metadata: {
          blockNumber: 1,
          outstandingAmount: outstanding,
          minPayment,
          blockEndDate
        }
      });

      await communication.save();

      console.log(`📧 Mock Email sent to ${borrowerEmail}: ${subject}`);
      
      return {
        emailId,
        subject,
        body,
        status: 'DELIVERED'
      };
    } catch (error) {
      console.error('Mock email error:', error);
      throw error;
    }
  }

  // Mock Razorpay payment
  static async processRazorpayPayment(amount, currency = 'INR') {
    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock successful payment response
      const paymentResponse = {
        success: true,
        paymentId: `pay_${uuidv4().replace(/-/g, '')}`,
        amount: amount * 100, // Razorpay expects amount in paisa
        currency,
        status: 'captured',
        method: 'netbanking',
        description: 'PaySafe Escrow Payment',
        createdAt: new Date(),
        capturedAt: new Date()
      };

      console.log(`💳 Mock Razorpay Payment: ₹${amount} - ${paymentResponse.paymentId}`);
      
      return paymentResponse;
    } catch (error) {
      console.error('Mock Razorpay payment error:', error);
      throw error;
    }
  }

  // Mock KYC verification
  static async verifyKYC(pan, aadhaar, bankAccount, ifsc) {
    try {
      // Simulate KYC verification delay
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock verification response
      const verificationResponse = {
        success: true,
        verificationId: `kyc_${uuidv4()}`,
        panVerified: true,
        aadhaarVerified: true,
        bankAccountVerified: true,
        ifscVerified: true,
        riskScore: Math.floor(Math.random() * 100) + 1,
        verifiedAt: new Date(),
        message: 'KYC verification completed successfully'
      };

      console.log(`🔍 Mock KYC Verification: PAN ${pan.slice(0, 2)}****${pan.slice(-2)} - ${verificationResponse.verificationId}`);
      
      return verificationResponse;
    } catch (error) {
      console.error('Mock KYC verification error:', error);
      throw error;
    }
  }

  // Get communication history for a loan
  static async getCommunicationHistory(loanId) {
    try {
      const communications = await Communication.find({ loanId })
        .sort({ sentAt: -1 });

      return communications;
    } catch (error) {
      console.error('Get communication history error:', error);
      throw error;
    }
  }

  // Generate TTS audio (mock)
  static async generateTTSAudio(transcript) {
    try {
      // Mock TTS generation
      const audioUrl = `/api/mock/tts/${uuidv4()}.mp3`;
      
      console.log(`🎵 Mock TTS Audio generated: ${audioUrl}`);
      
      return {
        audioUrl,
        duration: Math.floor(transcript.length / 10) + 5, // Rough estimate
        format: 'mp3',
        quality: 'high'
      };
    } catch (error) {
      console.error('Mock TTS generation error:', error);
      throw error;
    }
  }
}

module.exports = MockServices;


