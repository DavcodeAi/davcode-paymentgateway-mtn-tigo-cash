// Paypack API Types

export interface PaypackAuthRequest {
  client_id: string;
  client_secret: string;
}

export interface PaypackAuthResponse {
  access: string;
  refresh: string;
  expires: string;
}

export interface PaypackRefreshResponse {
  access: string;
  refresh: string;
  expires: string;
}

export interface PaypackTransaction {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  reference: string;
  description?: string;
  customer_email?: string;
  customer_phone?: string;
  created_at: string;
  updated_at: string;
}

export interface PaypackPaymentRequest {
  amount: number;
  currency: string;
  description?: string;
  customer_email?: string;
  customer_phone?: string;
  callback_url?: string;
  return_url?: string;
  reference?: string;
}

export interface PaypackPaymentResponse {
  transaction_id: string;
  payment_url: string;
  reference: string;
  status: string;
}

export interface PaypackWebhookPayload {
  event: 'payment.completed' | 'payment.failed' | 'payment.cancelled';
  data: PaypackTransaction;
  timestamp: string;
}

export interface PaypackError {
  error: string;
  message: string;
  status_code: number;
}

// Application-specific types
export interface PaymentFormData {
  amount: number;
  currency: string;
  description: string;
  customer_email: string;
  customer_phone?: string;
}

export interface PaymentSession {
  transaction_id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
}
