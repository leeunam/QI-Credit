// Utilitários para validação de campos do onboarding
export const validationUtils = {
  // 1. Validação de nome - apenas letras e espaços, até 255 caracteres
  validateFullName: (name: string): { isValid: boolean; message?: string } => {
    if (!name.trim()) {
      return { isValid: false, message: 'Nome é obrigatório' };
    }

    if (name.length > 255) {
      return {
        isValid: false,
        message: 'Nome deve ter no máximo 255 caracteres',
      };
    }

    // Regex para permitir apenas letras (maiúsculas e minúsculas), espaços, acentos e hífens
    const nameRegex = /^[a-zA-ZÀ-ÿ\u00C0-\u017F\s'-]+$/;
    if (!nameRegex.test(name)) {
      return { isValid: false, message: 'Nome deve conter apenas letras' };
    }

    if (name.trim().length < 3) {
      return {
        isValid: false,
        message: 'Nome deve ter pelo menos 3 caracteres',
      };
    }

    return { isValid: true };
  },

  // 2. Validação e formatação de CPF/CNPJ - apenas números, até 14 caracteres
  validateDocument: (
    document: string
  ): {
    isValid: boolean;
    message?: string;
    cleanDocument?: string;
    documentType?: 'F' | 'J';
  } => {
    if (!document.trim()) {
      return { isValid: false, message: 'CPF/CNPJ é obrigatório' };
    }

    // Remove tudo que não for número
    const cleanDocument = document.replace(/\D/g, '');

    if (cleanDocument.length === 0) {
      return { isValid: false, message: 'CPF/CNPJ deve conter apenas números' };
    }

    if (cleanDocument.length !== 11 && cleanDocument.length !== 14) {
      return {
        isValid: false,
        message: 'CPF deve ter 11 dígitos ou CNPJ deve ter 14 dígitos',
      };
    }

    // Determina o tipo de pessoa
    const documentType = cleanDocument.length === 11 ? 'F' : 'J';

    // Validação básica de CPF
    if (documentType === 'F' && !isValidCPF(cleanDocument)) {
      return { isValid: false, message: 'CPF inválido' };
    }

    // Validação básica de CNPJ
    if (documentType === 'J' && !isValidCNPJ(cleanDocument)) {
      return { isValid: false, message: 'CNPJ inválido' };
    }

    return {
      isValid: true,
      cleanDocument,
      documentType,
    };
  },

  // 3. Validação de email - até 255 caracteres, regex obrigatória
  validateEmail: (email: string): { isValid: boolean; message?: string } => {
    if (!email.trim()) {
      return { isValid: false, message: 'Email é obrigatório' };
    }

    if (email.length > 255) {
      return {
        isValid: false,
        message: 'Email deve ter no máximo 255 caracteres',
      };
    }

    // Regex conforme especificação
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, message: 'Email deve ter um formato válido' };
    }

    return { isValid: true };
  },

  // 4. Validação de senha - mínimo 8, máximo 20 caracteres
  validatePassword: (
    password: string
  ): { isValid: boolean; message?: string } => {
    if (!password) {
      return { isValid: false, message: 'Senha é obrigatória' };
    }

    if (password.length < 8) {
      return {
        isValid: false,
        message: 'Senha deve ter pelo menos 8 caracteres',
      };
    }

    if (password.length > 20) {
      return {
        isValid: false,
        message: 'Senha deve ter no máximo 20 caracteres',
      };
    }

    return { isValid: true };
  },

  // Formatação de CPF/CNPJ para exibição
  formatDocument: (document: string): string => {
    const clean = document.replace(/\D/g, '');

    if (clean.length === 11) {
      // CPF: 000.000.000-00
      return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (clean.length === 14) {
      // CNPJ: 00.000.000/0000-00
      return clean.replace(
        /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
        '$1.$2.$3/$4-$5'
      );
    }

    return document;
  },

  // Limita entrada apenas a números para CPF/CNPJ
  onlyNumbers: (value: string): string => {
    return value.replace(/\D/g, '');
  },

  // Limita entrada apenas a letras para nome
  onlyLetters: (value: string): string => {
    return value.replace(/[^a-zA-ZÀ-ÿ\u00C0-\u017F\s'-]/g, '');
  },
};

// Função auxiliar para validar CPF
function isValidCPF(cpf: string): boolean {
  if (cpf.length !== 11) return false;

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf[i]) * (10 - i);
  }
  let digit1 = 11 - (sum % 11);
  if (digit1 > 9) digit1 = 0;

  if (parseInt(cpf[9]) !== digit1) return false;

  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf[i]) * (11 - i);
  }
  let digit2 = 11 - (sum % 11);
  if (digit2 > 9) digit2 = 0;

  return parseInt(cpf[10]) === digit2;
}

// Função auxiliar para validar CNPJ
function isValidCNPJ(cnpj: string): boolean {
  if (cnpj.length !== 14) return false;

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{13}$/.test(cnpj)) return false;

  // Validação do primeiro dígito verificador
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cnpj[i]) * weights1[i];
  }
  let digit1 = 11 - (sum % 11);
  if (digit1 > 9) digit1 = 0;

  if (parseInt(cnpj[12]) !== digit1) return false;

  // Validação do segundo dígito verificador
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cnpj[i]) * weights2[i];
  }
  let digit2 = 11 - (sum % 11);
  if (digit2 > 9) digit2 = 0;

  return parseInt(cnpj[13]) === digit2;
}
