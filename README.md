# LendAndBorrow - P2P Lending Platform Demo

A comprehensive friend-to-friend P2P lending platform with KYC onboarding, escrow management, flexible repayment terms, and CIBIL reporting. Built as a professional demo showcasing fintech compliance workflows.

## 🚀 Features

### Core Functionality
- **User Authentication & KYC**: Complete onboarding with dummy verification
- **P2P Lending**: Friend-to-friend loan creation and management
- **Escrow System**: Secure fund holding with Razorpay sandbox integration
- **Flexible Repayment**: 30-day terms with 10-day grace periods
- **Block-based Fees**: Rolling 1% fees for missed payments
- **CIBIL Reporting**: Automated credit bureau reporting for defaults
- **Time Simulation**: Admin controls for demo purposes

### Business Rules
- **Initial Platform Fee**: 1% of principal amount
- **Block Fee Rate**: 1% per 10-day block after grace period
- **Minimum Payment**: 20% of outstanding per block
- **Grace Period**: 10 days after 30-day term
- **Block Structure**: 4 blocks of 10 days each
- **CIBIL Reporting**: Automatic on block default

### Mock Services
- **MockCIBIL**: Simulated credit bureau reporting
- **MockVoIP**: Automated call transcripts and TTS
- **MockSMS**: SMS reminder system
- **MockEmail**: Email notification system

## 🛠 Tech Stack

### Frontend
- **React 18** with functional components and hooks
- **TailwindCSS** for styling with custom design system
- **Headless UI** for accessible components
- **React Router** for navigation
- **Axios** for API communication
- **React Hot Toast** for notifications

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Razorpay** sandbox integration
- **Bcrypt** for password hashing
- **Joi** for validation

### Development Tools
- **Concurrently** for running multiple processes
- **Nodemon** for backend development
- **ESLint** for code quality

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Git

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd LendAndBorrow
```

### 2. Install Dependencies
```bash
npm run install:all
```

### 3. Environment Setup
```bash
# Copy environment template
cp server/env.example server/.env

# Edit server/.env with your configuration
MONGODB_URI=mongodb://localhost:27017/lendandborrow-demo
JWT_SECRET=your-super-secret-jwt-key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
PORT=5001
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

### 4. Seed Demo Data
```bash
npm run seed
```

### 5. Start Development Servers
```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:5001`
- Frontend development server on `http://localhost:3000`

## 🎭 Demo Credentials

### Users
| Role | Email | Password | Phone | KYC Status |
|------|-------|----------|-------|------------|
| Lender | user_a@lendandborrow.com | demo123 | +919000000001 | VERIFIED |
| Borrower | user_b@lendandborrow.com | demo123 | +919000000002 | VERIFIED |
| Admin | admin@lendandborrow.com | admin123 | +919000000000 | VERIFIED |
| Demo | demo@lendandborrow.com | demo123 | +919000000003 | VERIFIED |

### Sample Loan
- **Loan ID**: loan_1
- **Principal**: ₹1,000
- **Platform Fee**: ₹10
- **Status**: PENDING_BORROWER_ACCEPT
- **Escrow**: FUNDED

## 📖 Demo Scenarios

### Scenario A: Happy Path
1. **Login as Priya Rajesh (Lender)**
   - Go to `/lend`
   - Create loan for Arjun Kumar (₹1,000)
   - Fund escrow (simulated payment)

2. **Login as Arjun Kumar (Borrower)**
   - Go to `/borrow`
   - Accept loan terms
   - Funds are released

3. **Make Early Payment**
   - Go to `/repayment/loan_1`
   - Pay full amount (₹1,000)
   - Loan completed successfully

### Scenario B: Partial Payments with Default
1. **Follow Scenario A steps 1-2**

2. **Admin Time Simulation**
   - Login as admin
   - Use Time Simulator to advance +40 days
   - First checkpoint reached

3. **Make Partial Payment**
   - Arjun Kumar pays minimum required (₹200 + ₹10 fee)
   - Outstanding reduced to ₹800

4. **Advance Time Again**
   - Admin advances +10 days (Day 50)
   - Second checkpoint reached

5. **Miss Payment**
   - Arjun Kumar doesn't pay minimum
   - CIBIL report generated
   - Loan status: DEFAULT_REPORTED

### Scenario C: Multiple Defaults
1. **Follow Scenario B steps 1-4**

2. **Continue Advancing Time**
   - Admin advances to Day 60, 70, 80
   - Multiple CIBIL reports generated
   - Each report shows outstanding amount

## 🎯 Key Demo Features

### Time Simulator (Admin Only)
- **Quick Advance**: +10, +30, +40, +50 days
- **Custom Advance**: Any number of days
- **Triggers**: Block evaluations, fee applications, CIBIL reporting

### Loan Management
- **Escrow Protection**: Funds held until borrower acceptance
- **Payment Allocation**: Fees first, then principal
- **Block Tracking**: Visual timeline of payment blocks
- **Status Updates**: Real-time loan status changes

### Communication System
- **Automated Reminders**: VoIP, SMS, Email
- **Call Transcripts**: Mock conversation logs
- **Collection Tracking**: Communication history

### CIBIL Reporting
- **Automatic Generation**: On block defaults
- **Report Details**: Amount, block number, reference ID
- **Export Functionality**: CSV download
- **Status Tracking**: PENDING, REPORTED, RESOLVED

## 🏗 Project Structure

```
LendAndBorrow/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── index.js
│   ├── package.json
│   └── tailwind.config.js
├── server/                 # Node.js backend
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── middleware/        # Express middleware
│   ├── scripts/           # Database scripts
│   ├── index.js
│   └── package.json
├── package.json           # Root package.json
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/send-otp` - Send OTP (mock)
- `POST /api/auth/verify-otp` - Verify OTP (mock)

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:userId` - Get user by ID
- `PUT /api/users/kyc` - Update KYC data
- `PUT /api/users/profile` - Update profile
- `GET /api/users/dashboard/summary` - Dashboard data

### Loans
- `POST /api/loans` - Create loan
- `GET /api/loans` - Get user loans
- `GET /api/loans/:loanId` - Get loan details
- `POST /api/loans/:loanId/fund-escrow` - Fund escrow
- `POST /api/loans/:loanId/accept` - Accept loan terms
- `POST /api/loans/:loanId/payment` - Make payment
- `POST /api/loans/:loanId/cancel` - Cancel loan
- `GET /api/loans/pending/offers` - Pending offers
- `GET /api/loans/:loanId/payment-requirements` - Payment requirements
- `GET /api/loans/:loanId/ledger` - Transaction ledger
- `GET /api/loans/:loanId/blocks` - Block history

### Payments
- `POST /api/payments/razorpay` - Process payment (mock)
- `POST /api/payments/razorpay/order` - Create order (mock)
- `POST /api/payments/razorpay/verify` - Verify payment (mock)
- `GET /api/payments/methods` - Get payment methods

### CIBIL
- `POST /api/mock-cibil/report` - Report to CIBIL (mock)
- `GET /api/mock-cibil/reports` - Get CIBIL reports
- `GET /api/mock-cibil/reports/:reportId` - Get report details
- `PUT /api/mock-cibil/reports/:reportId/status` - Update report status
- `GET /api/mock-cibil/reports/export/csv` - Export reports

### Communications
- `GET /api/communications/loan/:loanId` - Get communication history
- `POST /api/communications/call` - Send VoIP call (mock)
- `POST /api/communications/sms` - Send SMS (mock)
- `POST /api/communications/email` - Send email (mock)
- `POST /api/communications/tts` - Generate TTS (mock)

### Admin
- `GET /api/admin/dashboard` - Admin dashboard
- `POST /api/admin/scheduler/run` - Run scheduler
- `POST /api/admin/time/simulate` - Simulate time
- `GET /api/admin/loans` - Get all loans
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:userId/kyc` - Update user KYC
- `POST /api/admin/cibil/report` - Force CIBIL report
- `GET /api/admin/audit-logs` - Get audit logs
- `PUT /api/admin/settings` - Update settings
- `GET /api/admin/health` - System health

## 🚀 Deployment

### Vercel Deployment

#### Frontend (Vercel)
1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login to Vercel
   vercel login
   
   # Deploy from client directory
   cd client
   vercel
   ```

2. **Environment Variables**
   ```
   REACT_APP_API_URL=https://your-backend-url.vercel.app/api
   ```

#### Backend (Vercel)
1. **Create vercel.json**
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "server/index.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/api/(.*)",
         "dest": "server/index.js"
       }
     ]
   }
   ```

2. **Deploy**
   ```bash
   vercel
   ```

### MongoDB Atlas Setup
1. **Create Cluster**
   - Go to [MongoDB Atlas](https://cloud.mongodb.com)
   - Create new cluster
   - Get connection string

2. **Update Environment**
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lendandborrow-demo
   ```

### Environment Variables (Production)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lendandborrow-demo
JWT_SECRET=your-production-jwt-secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
PORT=5001
NODE_ENV=production
CLIENT_URL=https://your-frontend-url.vercel.app
```

## 🔒 Security Considerations

### Demo vs Production
- **KYC Verification**: Currently mocked, integrate with real providers
- **Payment Processing**: Uses Razorpay sandbox, switch to live keys
- **CIBIL Integration**: Mock service, integrate with real CIBIL APIs
- **Communication**: Mock services, integrate with real SMS/VoIP providers

### Security Best Practices
- **JWT Secrets**: Use strong, unique secrets in production
- **HTTPS**: Always use HTTPS in production
- **Rate Limiting**: Implement rate limiting for API endpoints
- **Input Validation**: Validate all user inputs
- **Error Handling**: Don't expose sensitive information in errors

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration and login
- [ ] KYC completion flow
- [ ] Loan creation and escrow funding
- [ ] Loan acceptance and disbursement
- [ ] Payment processing
- [ ] Time simulation and block evaluation
- [ ] CIBIL reporting
- [ ] Communication system
- [ ] Admin panel functionality

### Demo Validation
- [ ] All demo scenarios work correctly
- [ ] Business rules are enforced
- [ ] UI/UX is responsive and intuitive
- [ ] Error handling is graceful
- [ ] Data persistence works correctly

## 📊 Business Logic Validation

### Payment Allocation
```javascript
// Fees are paid first, then principal
const feePayment = Math.min(amount, outstandingFees);
const principalPayment = Math.min(remainingAmount, outstanding);
```

### Block Fee Calculation
```javascript
// 1% fee on outstanding at block start
const blockFee = Math.round(outstanding * 0.01 * 100) / 100;
```

### Minimum Payment
```javascript
// 20% of outstanding amount
const minPayment = Math.round(outstanding * 0.20 * 100) / 100;
```

### CIBIL Reporting
```javascript
// Report outstanding principal only (not fees)
const amountReported = loan.outstanding;
```

## 🎨 Design System

### Color Palette
- **Navy**: #0b1540 (Primary)
- **Teal**: #0fb5a6 (Accent)
- **Gold**: #f1c40f (Warning)
- **Gray Scale**: #f9fafb to #111827

### Typography
- **Font Family**: Inter
- **Hierarchy**: Clear heading and body text sizes
- **Accessibility**: WCAG AA compliant

### Components
- **Cards**: Consistent shadow and border radius
- **Buttons**: Primary, secondary, outline variants
- **Forms**: Consistent input styling and validation
- **Status Badges**: Color-coded status indicators

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

### Code Standards
- **ESLint**: Follow configured rules
- **Prettier**: Consistent code formatting
- **Comments**: Document complex business logic
- **Error Handling**: Graceful error handling

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

### Common Issues

#### MongoDB Connection
```bash
# Check if MongoDB is running
mongod --version

# Check connection string format
mongodb://localhost:27017/lendandborrow-demo
```

#### Port Conflicts
```bash
# Check if ports are in use
lsof -i :3000
lsof -i :5001

# Kill processes if needed
kill -9 <PID>
```

#### Environment Variables
```bash
# Verify .env file exists
ls -la server/.env

# Check variable names match exactly
cat server/.env
```

### Demo Troubleshooting
1. **Seed Data Issues**: Run `npm run seed` again
2. **Login Problems**: Use exact demo credentials
3. **Time Simulation**: Ensure you're logged in as admin
4. **Payment Issues**: Check browser console for errors

## 🎯 Future Enhancements

### Production Features
- **Real KYC Integration**: Aadhaar, PAN verification
- **Live Payment Gateway**: Razorpay production integration
- **Real CIBIL APIs**: Credit bureau integration
- **SMS/VoIP Services**: Twilio, AWS SNS integration
- **Advanced Analytics**: Loan performance metrics
- **Mobile App**: React Native implementation

### Technical Improvements
- **Unit Tests**: Jest and React Testing Library
- **Integration Tests**: API endpoint testing
- **Performance**: Database indexing and optimization
- **Monitoring**: Application performance monitoring
- **CI/CD**: Automated testing and deployment

---

**Built with ❤️ for fintech demonstration purposes**

*This is a demo application. All financial transactions and verifications are simulated for demonstration purposes only.*
