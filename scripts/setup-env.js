const fs = require('fs');
const path = require('path');

console.log('Setting up environment files...');

// Root .env
const rootEnvExample = path.join(__dirname, '..', '.env.example');
const rootEnv = path.join(__dirname, '..', '.env');

if (fs.existsSync(rootEnvExample)) {
  if (!fs.existsSync(rootEnv)) {
    fs.copyFileSync(rootEnvExample, rootEnv);
    console.log('Created .env from .env.example (backend config)');
  } else {
    console.log('ℹ.env already exists in root');
  }
} else {
  console.log('.env.example not found in root');
}

// Frontend .env
const frontendEnvExample = path.join(
  __dirname,
  '..',
  'frontend',
  '.env.example'
);
const frontendEnv = path.join(__dirname, '..', 'frontend', '.env');

if (fs.existsSync(frontendEnvExample)) {
  if (!fs.existsSync(frontendEnv)) {
    fs.copyFileSync(frontendEnvExample, frontendEnv);
    console.log(
      'Created frontend/.env from frontend/.env.example (public config)'
    );
  } else {
    console.log('frontend/.env already exists');
  }
} else {
  const frontendEnvContent = `# Frontend Public Configuration (exposed via VITE_)
VITE_API_URL=http://localhost:3000
VITE_BLOCKCHAIN_RPC=https://sepolia.scroll.io
VITE_ESCROW_CONTRACT_ADDRESS=contract_address_after_deploy
VITE_TOKEN_CONTRACT_ADDRESS=token_contract_address_after_deploy
VITE_ENABLE_MOCK_MODE=true
VITE_APP_NAME=QI Credit
VITE_APP_VERSION=0.1.0
`;

  fs.writeFileSync(frontendEnvExample, frontendEnvContent);
  fs.writeFileSync(frontendEnv, frontendEnvContent);
  console.log(
    'Created frontend/.env.example and frontend/.env (public config)'
  );
}
