// API utility functions for server-side requests

import { env } from './env.server';
import type { PaypackError } from '~/types/paypack';

export class PaypackAPIError extends Error {
  constructor(
    public statusCode: number,
    public error: string,
    message: string
  ) {
    super(message);
    this.name = 'PaypackAPIError';
  }
}

export interface APIRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  requiresAuth?: boolean;
  accessToken?: string;
}

export async function makePaypackRequest<T>(
  endpoint: string,
  options: APIRequestOptions = {}
): Promise<T> {
  const {
    method = 'GET',
    headers = {},
    body,
    requiresAuth = false,
    accessToken
  } = options;

  const url = `${env.PAYPACK_BASE_URL}${endpoint}`;
  
  const requestHeaders: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...headers,
  };

  if (requiresAuth && accessToken) {
    requestHeaders['Authorization'] = `Bearer ${accessToken}`;
  }

  const requestOptions: RequestInit = {
    method,
    headers: requestHeaders,
  };

  if (body && (method === 'POST' || method === 'PUT')) {
    requestOptions.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, requestOptions);
    
    if (!response.ok) {
      let errorData: PaypackError;
      try {
        errorData = await response.json();
      } catch {
        errorData = {
          error: 'Unknown Error',
          message: `HTTP ${response.status}: ${response.statusText}`,
          status_code: response.status,
        };
      }
      
      throw new PaypackAPIError(
        response.status,
        errorData.error,
        errorData.message
      );
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    if (error instanceof PaypackAPIError) {
      throw error;
    }
    
    // Network or other errors
    throw new PaypackAPIError(
      500,
      'Network Error',
      error instanceof Error ? error.message : 'Unknown network error'
    );
  }
}

export function logAPIRequest(endpoint: string, method: string, success: boolean, duration?: number): void {
  const timestamp = new Date().toISOString();
  const status = success ? '✅' : '❌';
  const durationStr = duration ? ` (${duration}ms)` : '';
  
  console.log(`${status} [${timestamp}] ${method} ${endpoint}${durationStr}`);
}
