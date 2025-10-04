# Installation Guide

## System Requirements

Before installing QI Credit, ensure your system meets the following requirements:

### Minimum Requirements
- **Operating System**: Windows 10+, macOS 10.15+, Ubuntu 18.04+ or equivalent
- **RAM**: 8GB minimum (16GB recommended)
- **Storage**: 10GB free disk space
- **Internet Connection**: Stable broadband connection

### Software Dependencies
- **Node.js**: Version 16.x or higher
- **npm**: Version 8.x or higher (comes with Node.js)
- **Git**: Latest stable version
- **PostgreSQL**: Version 13+ (optional, for database features)
- **Docker**: Latest version (optional, for containerization)

## Prerequisites Installation

### Installing Node.js and npm

#### Windows/macOS
1. Download the LTS version from [nodejs.org](https://nodejs.org/)
2. Run the installer and follow the setup wizard
3. Verify installation:
```bash
node --version
npm --version
```

#### Ubuntu/Debian
```bash
# Update package list
sudo apt update

# Install Node.js
sudo apt install nodejs npm

# Or use NodeSource for latest versions
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### macOS (using Homebrew)
```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node
```

### Installing Git

#### Windows
Download from [git-scm.com](https://git-scm.com/download/win) and run the installer.

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install git
```

#### macOS
```bash
# Using Homebrew
brew install git
```

### Installing PostgreSQL (Optional)

#### Windows
Download from [postgresql.org](https://www.postgresql.org/download/windows/) and follow the installation guide.

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

#### macOS
```bash
# Using Homebrew
brew install postgresql
```

## Cloning the Repository

Clone the QI Credit repository to your local machine:

```bash
# Navigate to your preferred directory
cd /path/to/your/projects

# Clone the repository
git clone https://github.com/your-repo/qi-credit.git

# Navigate to the project directory
cd qi-credit
```

## Environment Setup

### Creating Environment Configuration

Copy the example environment file:
```bash
# From the project root directory
cp .env.example .env
```

Edit the `.env` file with your configuration:
```bash
nano .env
```

For development with mock services (recommended), use:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration (adjust as needed)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=qicredit_db
DB_USER=postgres
DB_PASSWORD=your_password

# QI Tech Mock Mode (key feature for development)
QITECH_MOCK_MODE=true
BLOCKCHAIN_MOCK_MODE=true

# API Keys (not needed in mock mode)
QITECH_API_KEY=your_qitech_api_key
QITECH_CREDIT_ANALYSIS_URL=https://api.sandbox.caas.qitech.app/credit_analysis/
QITECH_BANKING_URL=https://api.sandbox.caas.qitech.app/banking/
QITECH_LAAS_URL=https://api.sandbox.caas.qitech.app/laas/
QITECH_FRAUD_URL=https://api.sandbox.caas.qitech.app/fraud/
QITECH_OPEN_FINANCE_URL=https://api.sandbox.caas.qitech.app/open-finance/
QITECH_WEBHOOK_SECRET=your_webhook_secret

# Blockchain Configuration
BLOCKCHAIN_RPC_URL=https://sepolia.scroll.io
PRIVATE_KEY=your_private_key_here
ESCROW_CONTRACT_ADDRESS=endereço_contrato_escrow
TOKEN_CONTRACT_ADDRESS=endereço_contrato_token

# Security Configuration
JWT_SECRET=sua_chave_secreta_para_jwt
INTERNAL_API_KEY=sua_chave_api_interna
```

## Installing Dependencies

### Root Dependencies
Install dependencies for the entire project:
```bash
# From the project root directory
npm install
```

### Backend Dependencies
Install backend-specific dependencies:
```bash
cd backend
npm install
```

### Frontend Dependencies
Install frontend-specific dependencies:
```bash
cd ../frontend
npm install
```

### Blockchain Dependencies
Install blockchain-specific dependencies:
```bash
cd ../blockchain
npm install
```

Return to the root directory:
```bash
cd ..
```

## Database Setup (Optional)

If you plan to use the database features:

1. Start PostgreSQL service:
```bash
# Ubuntu/Debian
sudo systemctl start postgresql

# macOS
brew services start postgresql
```

2. Create database and user:
```sql
# Connect to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE qicredit_db;
CREATE USER qicredit_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE qicredit_db TO qicredit_user;
\q
```

## Running Setup Scripts

Execute the automated setup script:
```bash
# From the project root directory
npm run setup
```

This script will:
- Install all required dependencies
- Compile smart contracts
- Set up database (if configured)
- Create necessary directories
- Verify environment configuration

## Verification Steps

### Checking Node.js and npm Installation
```bash
node --version
npm --version
```

Expected output:
```
v16.x.x or higher
8.x.x or higher
```

### Verifying Environment Configuration
```bash
# Check if mock mode is properly configured
cat .env | grep -E "(QITECH_MOCK_MODE|BLOCKCHAIN_MOCK_MODE)"
```

Expected output:
```
QITECH_MOCK_MODE=true
BLOCKCHAIN_MOCK_MODE=true
```

### Testing Dependency Installation
```bash
# Check backend dependencies
cd backend
npm list
cd ..

# Check frontend dependencies
cd frontend
npm list
cd ..

# Check blockchain dependencies
cd blockchain
npm list
cd ..
```

Each command should show installed packages without errors.

## Starting the Development Servers

### Backend Server
```bash
cd backend
npm run dev
```

Expected output:
```
Server running on port 3000
Connected to mock blockchain service
Credit Analysis Service initialized in mock mode
Banking as a Service initialized in mock mode
Lending as a Service initialized in mock mode
Fraud & KYC Service initialized in mock mode
```

### Frontend Server (Optional)
In a new terminal:
```bash
cd frontend
npm run dev
```

Expected output:
```
VITE v4.x.x ready in 1234 ms

➜ Local: http://localhost:5173/
```

### Blockchain Network (Optional)
For local blockchain development:
```bash
cd blockchain
npx hardhat node
```

## Testing the Installation

### Backend Health Check
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

### Registering a Test User
```bash
curl -X POST http://localhost:3000/api/onboarding/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "securePassword123",
    "phoneNumber": "11999999999"
  }'
```

Expected response:
```json
{
  "message": "User registered successfully",
  "userId": "user_xxxxxxxxxxxxx",
  "email": "test@example.com"
}
```

## Troubleshooting Common Issues

### Node.js Version Issues
If you encounter Node.js version compatibility issues:

1. Use Node Version Manager (nvm):
```bash
# Install nvm (Linux/macOS)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install and use Node.js LTS
nvm install --lts
nvm use --lts
```

### Permission Errors During Installation
If you encounter permission errors with npm:

1. Use npm with sudo (not recommended):
```bash
sudo npm install
```

2. Or fix npm permissions:
```bash
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.profile
source ~/.profile
```

### Port Already in Use
If port 3000 is already in use:

1. Find the process:
```bash
lsof -i :3000
```

2. Kill the process:
```bash
kill -9 PROCESS_ID
```

Or change the port in `.env`:
```env
PORT=3001
```

### Missing Environment Variables
If you get errors about missing environment variables:

1. Verify `.env` file exists:
```bash
ls -la .env
```

2. If missing, recreate it:
```bash
cp .env.example .env
```

### Database Connection Issues
If you have database connection issues:

1. Verify PostgreSQL is running:
```bash
# Ubuntu/Debian
sudo systemctl status postgresql

# macOS
brew services list | grep postgresql
```

2. Check database credentials in `.env`
3. Verify database exists and user has privileges

## Advanced Configuration

### Docker Setup (Optional)
For containerized deployment:

1. Install Docker Desktop or Docker Engine
2. Build and run containers:
```bash
docker-compose up --build
```

### HTTPS Configuration
For HTTPS in development:

1. Generate self-signed certificate:
```bash
openssl req -nodes -new -x509 -keyout server.key -out server.cert
```

2. Update server configuration to use HTTPS

### Monitoring Setup
For development monitoring:

1. Install monitoring tools:
```bash
npm install -g nodemon pm2
```

2. Use PM2 for process management:
```bash
pm2 start ecosystem.config.js
```

## Next Steps

After successful installation, proceed to:

1. **Run the complete test suite**:
```bash
npm test
```

2. **Explore API endpoints** using the documentation in `docs/endpoints.md`

3. **Start developing new features** by following the contribution guidelines

4. **Connect to real QI Tech APIs** when you have access by setting:
```env
QITECH_MOCK_MODE=false
BLOCKCHAIN_MOCK_MODE=false
```

5. **Deploy to production** following the deployment guide in `docs/deployment.md`