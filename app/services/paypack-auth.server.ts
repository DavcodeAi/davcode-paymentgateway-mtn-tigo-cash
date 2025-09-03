// Paypack Authentication Service

import { env } from '~/utils/env.server';
import { makePaypackRequest, logAPIRequest } from '~/utils/api.server';
import type {
  PaypackAuthRequest,
  PaypackAuthResponse,
  PaypackRefreshResponse,
} from '~/types/paypack';

interface TokenStorage {
  access_token: string;
  refresh_token: string;
  expires_at: Date;
}

// In-memory token storage (in production, use Redis or database)
let tokenStorage: TokenStorage | null = null;

export class PaypackAuthService {
  /**
   * Authenticate with Paypack using client credentials
   */
  static async authenticate(): Promise<PaypackAuthResponse> {
    const startTime = Date.now();
    
    try {
      const authRequest: PaypackAuthRequest = {
        client_id: env.PAYPACK_CLIENT_ID,
        client_secret: env.PAYPACK_CLIENT_SECRET,
      };

      const response = await makePaypackRequest<PaypackAuthResponse>(
        '/auth/agents/authorize',
        {
          method: 'POST',
          body: authRequest,
        }
      );

      // Store tokens
      tokenStorage = {
        access_token: response.access,
        refresh_token: response.refresh,
        expires_at: new Date(parseInt(response.expires) * 1000),
      };

      logAPIRequest('/auth/agents/authorize', 'POST', true, Date.now() - startTime);
      return response;
    } catch (error) {
      logAPIRequest('/auth/agents/authorize', 'POST', false, Date.now() - startTime);
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshToken(refreshToken?: string): Promise<PaypackRefreshResponse> {
    const startTime = Date.now();
    const token = refreshToken || tokenStorage?.refresh_token;
    
    if (!token) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await makePaypackRequest<PaypackRefreshResponse>(
        `/auth/agents/refresh/${token}`,
        {
          method: 'GET',
        }
      );

      // Update stored tokens
      tokenStorage = {
        access_token: response.access,
        refresh_token: response.refresh,
        expires_at: new Date(parseInt(response.expires) * 1000),
      };

      logAPIRequest(`/auth/agents/refresh/${token}`, 'GET', true, Date.now() - startTime);
      return response;
    } catch (error) {
      logAPIRequest(`/auth/agents/refresh/${token}`, 'GET', false, Date.now() - startTime);
      throw error;
    }
  }

  /**
   * Get valid access token (authenticate or refresh if needed)
   */
  static async getValidAccessToken(): Promise<string> {
    // Check if we have a valid token
    if (tokenStorage && tokenStorage.expires_at > new Date(Date.now() + 60000)) {
      return tokenStorage.access_token;
    }

    // Try to refresh if we have a refresh token
    if (tokenStorage?.refresh_token) {
      try {
        const refreshed = await this.refreshToken();
        return refreshed.access;
      } catch (error) {
        console.warn('Failed to refresh token, re-authenticating:', error);
      }
    }

    // Authenticate from scratch
    const auth = await this.authenticate();
    return auth.access;
  }

  /**
   * Check if we have valid authentication
   */
  static isAuthenticated(): boolean {
    return tokenStorage !== null && tokenStorage.expires_at > new Date();
  }

  /**
   * Clear stored tokens (logout)
   */
  static clearTokens(): void {
    tokenStorage = null;
  }

  /**
   * Get current token info (for debugging)
   */
  static getTokenInfo(): TokenStorage | null {
    return tokenStorage ? { ...tokenStorage } : null;
  }
}
