# Solução de Problemas - Selfie/Câmera

## Problemas Corrigidos

### 1. **Câmera não funciona/não mostra imagem**

**Soluções implementadas:**

- ✅ Verificação de suporte do navegador
- ✅ Aguarda carregamento completo do vídeo
- ✅ Tratamento específico de erros de permissão
- ✅ Indicador visual de status da câmera
- ✅ Fallback para upload de arquivo

### 2. **Botão "Capturar" não funciona**

**Soluções implementadas:**

- ✅ Validação do estado do vídeo antes da captura
- ✅ Verificação de dimensões válidas do vídeo
- ✅ Desabilita botão até câmera estar pronta
- ✅ Feedback visual do status ("Aguarde..." vs "Capturar")

### 3. **Problemas de permissão**

**Melhorias implementadas:**

- ✅ Mensagens específicas para cada tipo de erro:
  - `NotAllowedError`: Permissão negada
  - `NotFoundError`: Câmera não encontrada
  - `NotReadableError`: Câmera em uso
  - `OverconstrainedError`: Requisitos não atendidos
- ✅ Instruções claras para o usuário

## Como Testar

### 1. **Teste Básico**

1. Acesse `/onboarding` e vá até o Step 3
2. Clique em "Usar Câmera"
3. Permita acesso quando solicitado
4. Aguarde indicador "Ao vivo" aparecer
5. Clique em "Capturar"

### 2. **Teste de Fallback**

1. Negue permissão de câmera
2. Verifique se mostra opção "Enviar Foto"
3. Teste upload de arquivo

### 3. **Teste de Estados**

- **Carregando**: Mostra spinner e "Carregando câmera..."
- **Ativo**: Mostra indicador "Ao vivo" verde
- **Erro**: Mostra mensagem específica do problema

## Funcionalidades Implementadas

### **Estados da Câmera**

```typescript
const [cameraActive, setCameraActive] = useState(false); // Câmera iniciada
const [videoReady, setVideoReady] = useState(false); // Vídeo carregado
const [loading, setLoading] = useState(false); // Processando
```

### **Validações de Captura**

- Verifica se vídeo está carregado (`videoReady`)
- Valida dimensões do vídeo (`videoWidth`, `videoHeight`)
- Confirma elementos DOM válidos (`videoRef`, `canvasRef`)

### **Tratamento de Erros**

- **NotAllowedError**: Usuário negou permissão
- **NotFoundError**: Nenhuma câmera disponível
- **NotReadableError**: Câmera em uso por outro app
- **OverconstrainedError**: Câmera não atende requisitos

### **Interface Melhorada**

- Indicador "Ao vivo" quando câmera ativa
- Spinner durante carregamento
- Botão desabilitado até câmera pronta
- Instruções claras para o usuário
- Opção de fallback (upload de arquivo)

### **Limpeza de Recursos**

- `useEffect` para parar stream ao desmontar
- Função `stopCamera()` limpa todos os estados
- Tracks de mídia são adequadamente fechados

## Compatibilidade

### **Navegadores Suportados**

- ✅ Chrome 53+
- ✅ Firefox 36+
- ✅ Safari 11+
- ✅ Edge 12+

### **Dispositivos**

- ✅ Desktop com webcam
- ✅ Laptops com câmera integrada
- ✅ Tablets com câmera frontal
- ✅ Smartphones (Android/iOS)

### **Fallbacks**

- Upload de arquivo para dispositivos sem câmera
- Mensagens específicas para cada tipo de problema
- Opção alternativa sempre disponível

## Debugging

### **Console Logs**

```javascript
// Erros de câmera são logados para debug
console.error('Erro ao acessar câmera:', error);
```

### **Estados para Monitoring**

- `cameraActive`: Se a câmera foi iniciada
- `videoReady`: Se o vídeo está reproduzindo
- `stream`: Stream atual de mídia
- `loading`: Se está processando captura

### **Verificações de Saúde**

- Suporte a `getUserMedia`
- Dimensões válidas do vídeo
- Canvas context disponível
- Blob generation funcionando
