# 🔧 Guia de Resolução de Problemas - QI Credit

Este guia ajuda a resolver os problemas mais comuns durante a instalação e execução do projeto.

## 🚨 Problemas Comuns

### 1. Erro de Versão do Node.js

**Erro:** `Node.js version not compatible`

**Solução:**
```bash
# Verificar versão atual
node --version

# Se menor que v18, instale uma versão mais recente:
# Via Node Version Manager (recomendado)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# Ou baixe diretamente de nodejs.org
```

### 2. Problemas com PostgreSQL

#### Erro: "ECONNREFUSED ::1:5432"

**Causa:** PostgreSQL não está rodando

**Soluções:**

**Ubuntu/Debian:**
```bash
# Iniciar PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verificar status
sudo systemctl status postgresql
```

**macOS:**
```bash
# Com Homebrew
brew services start postgresql

# Verificar se está rodando
brew services list | grep postgresql
```

**Docker (Recomendado):**
```bash
# Criar container PostgreSQL
docker run --name postgres-qicredit \
  -e POSTGRES_DB=qicredit_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:14

# Verificar se está rodando
docker ps | grep postgres
```

#### Erro: "password authentication failed"

**Solução:**
```bash
# Verificar configurações no .env
cat .env | grep DB_

# Deve conter:
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=qicredit_db
```

### 3. Problemas com Dependências

#### Erro: "Module not found" ou "Cannot resolve dependency"

**Soluções:**
```bash
# Limpar cache do npm
npm cache clean --force

# Deletar node_modules e reinstalar
rm -rf node_modules package-lock.json
npm install

# Executar setup completo
npm run setup
```

#### Erro: "ERESOLVE unable to resolve dependency tree"

**Solução:**
```bash
# Forçar resolução de dependências
npm install --legacy-peer-deps

# Ou limpar e reinstalar
npm run clean
npm run setup
```

### 4. Problemas com Portas

#### Erro: "Port 3000 is already in use"

**Soluções:**
```bash
# Encontrar processo usando a porta
netstat -tulpn | grep :3000
# ou
lsof -i :3000

# Matar processo (substitua PID pelo número encontrado)
kill -9 PID

# Ou usar porta alternativa editando backend/.env
PORT=3001
```

#### Erro: "Port 8080 is already in use"

**Solução:**
```bash
# Editar frontend/vite.config.ts
server: {
  host: "::",
  port: 8081,  // Nova porta
}
```

### 5. Problemas com Blockchain

#### Erro: "Private key is not valid"

**Solução:**
```bash
# Gerar nova private key (desenvolvimento apenas)
node -e "console.log('0x' + require('crypto').randomBytes(32).toString('hex'))"

# Adicionar ao .env
PRIVATE_KEY=sua_nova_private_key
```

#### Erro: "Network not available"

**Solução:**
```bash
# Usar modo mock para desenvolvimento
# No .env:
BLOCKCHAIN_MOCK_MODE=true
```

### 6. Problemas com Scripts

#### Erro: "Permission denied" ao executar scripts

**Soluções:**
```bash
# Dar permissão aos scripts
chmod +x scripts/*.js

# Ou executar com node diretamente
node scripts/start.js
```

#### Erro: "npm run setup:env command not found"

**Solução:**
```bash
# Verificar se o script existe
ls scripts/setup-env.js

# Se não existir, criar manualmente:
cp .env.example .env
```

### 7. Problemas com Frontend

#### Página em branco ou erro 404

**Soluções:**
```bash
# Verificar se o backend está rodando
curl http://localhost:3000/health

# Limpar cache do navegador
# Chrome: Ctrl+Shift+R
# Firefox: Ctrl+F5

# Reconstruir frontend
cd frontend
npm run build
npm run dev
```

#### Erro: "Failed to compile"

**Soluções:**
```bash
# Verificar erros TypeScript
cd frontend
npm run type-check

# Corrigir lint
npm run lint

# Reinstalar dependências
rm -rf node_modules
npm install
```

### 8. Problemas de Performance

#### Lentidão no desenvolvimento

**Soluções:**
```bash
# Aumentar memória do Node.js
export NODE_OPTIONS="--max-old-space-size=4096"

# Desabilitar sourcemaps no desenvolvimento
# Em frontend/vite.config.ts:
build: {
  sourcemap: false
}
```

## 🆘 Scripts de Diagnóstico

### Script de Verificação Completa

```bash
# Criar script de diagnóstico
cat > diagnostico.js << 'EOF'
#!/usr/bin/env node

const { exec } = require('child_process');
const fs = require('fs');

console.log('🔍 QI CREDIT - DIAGNÓSTICO DO SISTEMA\n');

// Verificar Node.js
exec('node --version', (error, stdout) => {
  console.log(`Node.js: ${stdout.trim()}`);
});

// Verificar npm
exec('npm --version', (error, stdout) => {
  console.log(`npm: ${stdout.trim()}`);
});

// Verificar PostgreSQL
exec('psql --version', (error, stdout) => {
  if (error) {
    console.log('PostgreSQL: Não instalado');
  } else {
    console.log(`PostgreSQL: ${stdout.trim()}`);
  }
});

// Verificar Docker
exec('docker --version', (error, stdout) => {
  if (error) {
    console.log('Docker: Não instalado');
  } else {
    console.log(`Docker: ${stdout.trim()}`);
  }
});

// Verificar arquivo .env
if (fs.existsSync('.env')) {
  console.log('✅ Arquivo .env encontrado');
} else {
  console.log('❌ Arquivo .env não encontrado - execute: npm run setup:env');
}

// Verificar node_modules
if (fs.existsSync('node_modules')) {
  console.log('✅ Dependências instaladas');
} else {
  console.log('❌ Dependências não instaladas - execute: npm install');
}

console.log('\n📋 Execute os comandos sugeridos para corrigir problemas encontrados.');
EOF

# Executar diagnóstico
node diagnostico.js
```

## 📞 Suporte

Se nenhuma das soluções acima resolver seu problema:

1. **Verifique issues existentes**: [GitHub Issues](link-do-repositorio/issues)
2. **Crie uma nova issue** com:
   - Sistema operacional
   - Versões do Node.js e npm
   - Comando que causou o erro
   - Mensagem de erro completa
   - Output do script de diagnóstico

## 🔄 Reset Completo

Se tudo falhar, execute um reset completo:

```bash
# ⚠️ ATENÇÃO: Isto apagará todas as configurações locais

# 1. Limpar completamente
rm -rf node_modules
rm -rf frontend/node_modules  
rm -rf backend/node_modules
rm -rf blockchain/node_modules
rm -f .env
rm -f package-lock.json
rm -f frontend/package-lock.json
rm -f backend/package-lock.json

# 2. Reinstalar do zero
npm run setup:env
npm run setup

# 3. Reconfigurar .env
nano .env

# 4. Testar
npm run dev
```

---

**💡 Dica:** Mantenha este guia atualizado conforme novos problemas sejam identificados e resolvidos.