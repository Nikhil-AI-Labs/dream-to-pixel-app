/**
 * Security Service - Provides security utilities for the application
 */

export class SecurityService {
  /**
   * Validate JWT token structure and expiry (client-side validation only)
   * Note: Real validation should happen server-side
   */
  static validateToken(token: string): { valid: boolean; payload?: Record<string, unknown>; error?: string } {
    try {
      if (!token || typeof token !== 'string') {
        return { valid: false, error: 'Invalid token format' };
      }

      const parts = token.split('.');
      if (parts.length !== 3) {
        return { valid: false, error: 'Invalid JWT structure' };
      }

      const payload = JSON.parse(atob(parts[1]));
      const now = Date.now() / 1000;

      if (payload.exp && payload.exp < now) {
        return { valid: false, error: 'Token expired' };
      }

      return { valid: true, payload };
    } catch (error) {
      return { valid: false, error: error instanceof Error ? error.message : 'Token validation failed' };
    }
  }

  /**
   * Sanitize user input to prevent XSS attacks
   */
  static sanitizeInput(input: string, type: 'text' | 'email' | 'url' = 'text'): string {
    if (typeof input !== 'string') return '';

    // Remove null bytes
    let sanitized = input.replace(/\0/g, '');

    switch (type) {
      case 'email':
        // Basic email sanitization - remove dangerous chars, lowercase, trim
        sanitized = sanitized.toLowerCase().trim();
        sanitized = sanitized.replace(/[<>"'`]/g, '');
        // Validate basic email structure
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(sanitized)) {
          return '';
        }
        return sanitized;

      case 'url':
        sanitized = sanitized.trim();
        // Remove javascript: and data: protocols
        if (/^(javascript|data|vbscript):/i.test(sanitized)) {
          return '';
        }
        // Remove HTML-like content
        sanitized = sanitized.replace(/[<>"'`]/g, '');
        return sanitized;

      case 'text':
      default:
        // Escape HTML entities
        sanitized = sanitized.trim();
        sanitized = sanitized
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;');
        // Limit length
        return sanitized.slice(0, 10000);
    }
  }

  /**
   * Validate URL format
   */
  static isValidUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 255;
  }

  /**
   * Generate a secure random string
   */
  static generateSecureId(length: number = 32): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Hash sensitive data (for logging purposes - not for passwords)
   */
  static async hashData(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Check if running in secure context
   */
  static isSecureContext(): boolean {
    return window.isSecureContext === true;
  }

  /**
   * Rate limiting helper for client-side operations
   */
  static createRateLimiter(maxRequests: number, windowMs: number) {
    const requests: number[] = [];
    
    return {
      check: (): { allowed: boolean; remaining: number; resetTime?: number } => {
        const now = Date.now();
        const windowStart = now - windowMs;
        
        // Remove expired timestamps
        while (requests.length > 0 && requests[0] < windowStart) {
          requests.shift();
        }
        
        if (requests.length >= maxRequests) {
          return {
            allowed: false,
            remaining: 0,
            resetTime: Math.ceil((requests[0] + windowMs - now) / 1000)
          };
        }
        
        requests.push(now);
        return {
          allowed: true,
          remaining: maxRequests - requests.length
        };
      },
      reset: () => {
        requests.length = 0;
      }
    };
  }

  /**
   * Mask sensitive data for logging
   */
  static maskSensitiveData(data: string, visibleChars: number = 4): string {
    if (!data || data.length <= visibleChars * 2) {
      return '***';
    }
    const start = data.slice(0, visibleChars);
    const end = data.slice(-visibleChars);
    return `${start}${'*'.repeat(8)}${end}`;
  }

  /**
   * Validate API key format
   */
  static validateApiKeyFormat(key: string, type: 'openrouter' | 'gemini' | 'generic'): boolean {
    if (!key || typeof key !== 'string') return false;

    switch (type) {
      case 'openrouter':
        return key.startsWith('sk-or-') && key.length > 20;
      case 'gemini':
        return key.startsWith('AI') && key.length > 20;
      case 'generic':
      default:
        return key.length >= 10 && key.length <= 256;
    }
  }
}

/**
 * Content Security Policy helpers
 */
export const CSPHelpers = {
  /**
   * Generate nonce for inline scripts
   */
  generateNonce: (): string => {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array));
  },

  /**
   * Check if CSP is enabled
   */
  isCSPEnabled: (): boolean => {
    const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    return meta !== null;
  }
};

export default SecurityService;
