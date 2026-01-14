export const ValidationRules = {
  account: {
    name: {
      required: true,
      minLength: 2,
      maxLength: 100
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    notebookUrl: {
      required: true,
      pattern: /^https:\/\/colab\.research\.google\.com/
    }
  },

  apiKey: {
    openai: {
      pattern: /^sk-[a-zA-Z0-9]{32,}$/
    },
    openrouter: {
      pattern: /^sk-or-v1-[a-zA-Z0-9-]{48,}$/
    },
    gemini: {
      pattern: /^AI[a-zA-Z0-9_-]{35,}$/
    }
  }
};

export interface AccountValidationData {
  name?: string;
  email?: string;
  notebookUrl?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface ApiKeyValidationResult {
  isValid: boolean;
  error: string | null;
}

export const validateAccount = (accountData: AccountValidationData): ValidationResult => {
  const errors: Record<string, string> = {};

  if (!accountData.name?.trim()) {
    errors.name = 'Account name is required';
  } else if (accountData.name.length < ValidationRules.account.name.minLength) {
    errors.name = `Account name must be at least ${ValidationRules.account.name.minLength} characters`;
  } else if (accountData.name.length > ValidationRules.account.name.maxLength) {
    errors.name = `Account name must be less than ${ValidationRules.account.name.maxLength} characters`;
  }

  if (!accountData.email?.trim()) {
    errors.email = 'Email is required';
  } else if (!ValidationRules.account.email.pattern.test(accountData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!accountData.notebookUrl?.trim()) {
    errors.notebookUrl = 'Notebook URL is required';
  } else if (!ValidationRules.account.notebookUrl.pattern.test(accountData.notebookUrl)) {
    errors.notebookUrl = 'Please enter a valid Google Colab URL';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateApiKey = (type: keyof typeof ValidationRules.apiKey, key: string): ApiKeyValidationResult => {
  if (!key?.trim()) return { isValid: true, error: null }; // Optional keys

  const rule = ValidationRules.apiKey[type];
  if (rule?.pattern && !rule.pattern.test(key)) {
    return {
      isValid: false,
      error: `Invalid ${type.toUpperCase()} API key format`
    };
  }

  return { isValid: true, error: null };
};

export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 10000); // Limit length
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isValidEmail = (email: string): boolean => {
  return ValidationRules.account.email.pattern.test(email);
};
