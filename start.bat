@echo off
echo Starting LendAndBorrow Demo Application...
echo.

echo Installing dependencies...
call npm run install:all

echo.
echo Seeding demo data...
call npm run seed

echo.
echo Starting development servers...
echo Frontend: http://localhost:3000
echo Backend: http://localhost:5001
echo.
echo Demo Credentials:
echo Lender: user_a@lendandborrow.com / demo123
echo Borrower: user_b@lendandborrow.com / demo123
echo Admin: admin@lendandborrow.com / admin123
echo.

call npm run dev







