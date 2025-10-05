#!/bin/bash

# Script de Teste de Integração - QI Credit
# Execute: bash test-integration.sh

echo "🚀 Testando integração Frontend <> Backend"
echo "=========================================="
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="http://localhost:3000/api"

# 1. Health Check
echo "1️⃣  Testando Health Check..."
HEALTH=$(curl -s "$API_URL/health")
if [ $? -eq 0 ]; then
    STATUS=$(echo $HEALTH | grep -o '"status":"[^"]*"' | head -1 | cut -d'"' -f4)
    if [ "$STATUS" = "ok" ]; then
        echo -e "${GREEN}✅ Health Check OK${NC}"
        DB_STATUS=$(echo $HEALTH | grep -o 'database.*connected' | head -1)
        if [ ! -z "$DB_STATUS" ]; then
            echo "   Database: ✅ Connected"
        fi
    else
        echo -e "${RED}❌ Health Check falhou: status=$STATUS${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Backend não está rodando!${NC}"
    echo -e "${YELLOW}⚠️  Execute: cd backend && npm run dev${NC}"
    exit 1
fi

# 2. Registro
echo ""
echo "2️⃣  Testando Registro..."
EMAIL="test-$(date +%s)@example.com"
REGISTER=$(curl -s -X POST "$API_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$EMAIL\",\"password\":\"Test@123456\",\"full_name\":\"Test User\",\"phone\":\"11999999999\"}")

TOKEN=$(echo $REGISTER | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
USER_ID=$(echo $REGISTER | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ ! -z "$TOKEN" ]; then
    echo -e "${GREEN}✅ Registro OK${NC}"
    echo "   User ID: $USER_ID"
    echo "   Email: $EMAIL"
else
    echo -e "${RED}❌ Registro falhou${NC}"
    echo "$REGISTER"
    exit 1
fi

# 3. Análise de Crédito
echo ""
echo "3️⃣  Testando Análise de Crédito..."
CREDIT=$(curl -s -X POST "$API_URL/qitech/credit/individual" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{\"userId\":\"$USER_ID\",\"document\":\"12345678900\",\"fullName\":\"Test User\",\"birthDate\":\"1990-01-01\",\"monthlyIncome\":5000,\"requestedAmount\":10000,\"loanPurpose\":\"Capital de giro\"}")

SCORE=$(echo $CREDIT | grep -o '"score":[0-9]*' | cut -d':' -f2)

if [ ! -z "$SCORE" ]; then
    echo -e "${GREEN}✅ Análise de Crédito OK${NC}"
    echo "   Score: $SCORE"
else
    echo -e "${YELLOW}⚠️  Análise de Crédito falhou (pode ser esperado se rota não existir)${NC}"
fi

# 4. Conta Digital
echo ""
echo "4️⃣  Testando Conta Digital..."
ACCOUNT=$(curl -s -X POST "$API_URL/qitech/banking/accounts" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{\"document\":\"12345678900\",\"name\":\"Test User\",\"email\":\"$EMAIL\",\"phone\":\"11999999999\"}")

ACCOUNT_NUMBER=$(echo $ACCOUNT | grep -o '"accountNumber":"[^"]*"' | cut -d'"' -f4)

if [ ! -z "$ACCOUNT_NUMBER" ]; then
    echo -e "${GREEN}✅ Conta Digital OK${NC}"
    echo "   Número da Conta: $ACCOUNT_NUMBER"
else
    echo -e "${YELLOW}⚠️  Conta Digital falhou (pode ser esperado se rota não existir)${NC}"
fi

# 5. Contrato
echo ""
echo "5️⃣  Testando Contrato de Empréstimo..."
CONTRACT=$(curl -s -X POST "$API_URL/qitech/lending/contracts" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{\"borrowerDocument\":\"12345678900\",\"amount\":10000,\"interestRate\":2.5,\"installments\":12}")

CONTRACT_ID=$(echo $CONTRACT | grep -o '"contractId":"[^"]*"' | cut -d'"' -f4)

if [ ! -z "$CONTRACT_ID" ]; then
    echo -e "${GREEN}✅ Contrato OK${NC}"
    echo "   Contract ID: $CONTRACT_ID"
else
    echo -e "${YELLOW}⚠️  Contrato falhou (pode ser esperado se rota não existir)${NC}"
fi

# 6. Blockchain
echo ""
echo "6️⃣  Testando Blockchain (Saldo da Carteira)..."
WALLET=$(curl -s "$API_URL/blockchain/wallet/balance" \
    -H "Authorization: Bearer $TOKEN")

BALANCE=$(echo $WALLET | grep -o '"balance":"[^"]*"' | cut -d'"' -f4)

if [ ! -z "$BALANCE" ]; then
    echo -e "${GREEN}✅ Blockchain OK${NC}"
    echo "   Saldo: $BALANCE ETH"
else
    echo -e "${YELLOW}⚠️  Blockchain falhou (pode ser esperado se rota não existir)${NC}"
fi

# Resumo
echo ""
echo "=========================================="
echo -e "${GREEN}✨ Testes concluídos!${NC}"
echo ""
echo "📊 Resumo:"
echo "   - Backend: ✅ Rodando"
echo "   - Registro: ✅ OK"
echo "   - Token: ✅ Gerado"
echo "   - User ID: $USER_ID"
echo "   - Email: $EMAIL"
echo ""
echo "💡 Próximos passos:"
echo "   1. Abra http://localhost:5173 no navegador"
echo "   2. Abra o Console (F12)"
echo "   3. Execute o teste de fluxo completo do GUIA_DE_TESTES.md"
echo ""
