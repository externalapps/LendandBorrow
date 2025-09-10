#!/bin/bash

echo "Starting PaySafe Demo Application..."
echo

echo "Installing dependencies..."
npm run install:all

echo
echo "Seeding demo data..."
npm run seed

echo
echo "Starting development servers..."
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:5001"
echo
echo "Demo Credentials:"
echo "Lender: user_a@paysafe.com / demo123"
echo "Borrower: user_b@paysafe.com / demo123"
echo "Admin: admin@paysafe.com / admin123"
echo

npm run dev







