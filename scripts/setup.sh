#!/bin/bash

# Setup script for QI Credit project
echo "Setting up QI Credit project..."

# Setup environment files first
echo "Setting up environment files..."
npm run setup:env

# Install dependencies
echo "Installing root dependencies..."
npm install

echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo "Installing backend dependencies..."
cd backend
npm install
cd ..

echo "Installing blockchain dependencies..."
cd blockchain
npm install
cd ..

echo "Setting up database..."
npm run db:setup

#!/bin/bash

echo "🚀 === SETUP COMPLETO QI CREDIT ==="

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instale Node.js 18+ primeiro."
    exit 1
fi

echo "✅ Node.js $(node --version) encontrado"

# 1. Instalar todas as dependências
echo ""
echo "📦 1. INSTALANDO DEPENDÊNCIAS..."
npm run install:deps

# 2. Setup ambiente
echo ""
echo "🔧 2. CONFIGURANDO AMBIENTE..."
npm run setup:env

# 3. Verificar .env
if [ ! -f ".env" ]; then
    echo "❌ Arquivo .env não encontrado. Execute 'npm run setup:env' primeiro."
    exit 1
fi

# 4. Executar migrações
echo ""
echo "🗄️ 3. EXECUTANDO MIGRAÇÕES..."
npm run db:migrate || echo "⚠️  Migração falhou - verifique configuração do banco"

# 5. Testar Storage
echo ""
echo "🌐 4. TESTANDO SUPABASE STORAGE..."
npm run test:storage || echo "⚠️  Storage falhou - verifique configuração Supabase"

# 6. Criar estrutura de pastas
echo ""
echo "📁 5. CRIANDO ESTRUTURA..."
mkdir -p backend/config
mkdir -p backend/services
mkdir -p backend/controllers
mkdir -p backend/middlewares
mkdir -p backend/routes
mkdir -p scripts
mkdir -p frontend/src/hooks
mkdir -p frontend/src/services

echo "Setup complete!"
echo "To run the application, use: npm run dev"
echo "To toggle between mock/real data, set DB_MOCK_MODE in .env"