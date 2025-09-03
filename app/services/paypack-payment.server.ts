// Paypack Payment Service

import { makePaypackRequest, logAPIRequest } from '~/utils/api.server';
import { PaypackAuthService } from './paypack-auth.server';
import type {
  PaypackPaymentRequest,
  PaypackPaymentResponse,
  PaypackTransaction,
} from '~/types/paypack';

export class PaypackPaymentService {
  /**
   * Create a new payment request (cashin)
   */
  static async createPayment(
    paymentData: PaypackPaymentRequest
  ): Promise<PaypackPaymentResponse> {
    const startTime = Date.now();

    try {
      const accessToken = await PaypackAuthService.getValidAccessToken();

      // Use the cashin endpoint for deposits
      const response = await makePaypackRequest<PaypackPaymentResponse>(
        '/transactions/cashin',
        {
          method: 'POST',
          body: {
            number: paymentData.customer_phone,
            amount: paymentData.amount,
            environment: 'production' // or 'sandbox' for testing
          },
          requiresAuth: true,
          accessToken,
        }
      );

      logAPIRequest('/transactions/cashin', 'POST', true, Date.now() - startTime);

      // Transform response to match expected format
      return {
        transaction_id: response.ref || response.id || `TXN-${Date.now()}`,
        payment_url: `https://payments.paypack.rw/payment/${response.ref || response.id}`,
        reference: response.ref || paymentData.reference || `REF-${Date.now()}`,
        status: response.status || 'pending'
      };
    } catch (error) {
      logAPIRequest('/transactions/cashin', 'POST', false, Date.now() - startTime);

      // Handle specific Paypack errors
      if (error instanceof PaypackAPIError) {
        // Check for insufficient balance or common mobile money errors
        const errorMessage = error.message.toLowerCase();
        if (errorMessage.includes('insufficient') || errorMessage.includes('balance') || errorMessage.includes('funds')) {
          throw new PaypackAPIError(
            error.statusCode,
            'INSUFFICIENT_BALANCE',
            'Insufficient balance in your mobile money account. Please top up and try again.'
          );
        } else if (errorMessage.includes('invalid') && errorMessage.includes('number')) {
          throw new PaypackAPIError(
            error.statusCode,
            'INVALID_PHONE',
            'Invalid phone number. Please check your mobile money number and try again.'
          );
        } else if (errorMessage.includes('timeout') || errorMessage.includes('network')) {
          throw new PaypackAPIError(
            error.statusCode,
            'NETWORK_ERROR',
            'Network timeout. Please check your network connection and try again.'
          );
        }
      }

      throw error;
    }
  }

  /**
   * Create a cashout request (withdrawal)
   */
  static async createCashout(
    paymentData: PaypackPaymentRequest
  ): Promise<PaypackPaymentResponse> {
    const startTime = Date.now();

    try {
      const accessToken = await PaypackAuthService.getValidAccessToken();

      // Use the cashout endpoint for withdrawals
      const response = await makePaypackRequest<PaypackPaymentResponse>(
        '/transactions/cashout',
        {
          method: 'POST',
          body: {
            number: paymentData.customer_phone,
            amount: paymentData.amount,
            environment: 'production' // or 'sandbox' for testing
          },
          requiresAuth: true,
          accessToken,
        }
      );

      logAPIRequest('/transactions/cashout', 'POST', true, Date.now() - startTime);

      // Transform response to match expected format
      return {
        transaction_id: response.ref || response.id || `TXN-${Date.now()}`,
        payment_url: `https://payments.paypack.rw/transaction/${response.ref || response.id}`,
        reference: response.ref || paymentData.reference || `REF-${Date.now()}`,
        status: response.status || 'pending'
      };
    } catch (error) {
      logAPIRequest('/transactions/cashout', 'POST', false, Date.now() - startTime);
      throw error;
    }
  }

  /**
   * Get payment status by transaction reference using Events API
   */
  static async getPaymentStatus(transactionRef: string): Promise<PaypackTransaction> {
    const startTime = Date.now();

    try {
      const accessToken = await PaypackAuthService.getValidAccessToken();

      // Use events API to get transaction status by reference
      const response = await makePaypackRequest<any>(
        `/events/transactions?ref=${transactionRef}`,
        {
          method: 'GET',
          requiresAuth: true,
          accessToken,
        }
      );

      logAPIRequest(`/events/transactions?ref=${transactionRef}`, 'GET', true, Date.now() - startTime);

      // Find the latest event for this transaction
      const transactions = response.transactions || [];
      if (transactions.length === 0) {
        throw new PaypackAPIError(404, 'NOT_FOUND', 'Transaction not found');
      }

      // Get the most recent event (should be sorted by created_at)
      const latestEvent = transactions[0];
      const txData = latestEvent.data || {};

      // Map Paypack status to our internal status based on event kind and status
      let mappedStatus = 'pending';
      if (latestEvent.event_kind === 'transaction:processed') {
        if (txData.status === 'successful') {
          mappedStatus = 'completed';
        } else if (txData.status === 'failed') {
          // Transaction bounced back - could be insufficient balance or user cancellation
          mappedStatus = 'insufficient_balance';
        }
      } else if (latestEvent.event_kind === 'transaction:created') {
        mappedStatus = 'pending';
      }

      return {
        id: latestEvent.event_id || txData.ref || transactionRef,
        amount: txData.amount || 0,
        currency: 'RWF',
        status: mappedStatus,
        reference: txData.ref || transactionRef,
        description: `${txData.kind || 'Transaction'} - ${txData.amount || 0} RWF`,
        customer_email: 'N/A',
        customer_phone: txData.client || '',
        created_at: txData.created_at || latestEvent.created_at || new Date().toISOString(),
        updated_at: txData.processed_at || latestEvent.created_at || new Date().toISOString(),
      };
    } catch (error) {
      logAPIRequest(`/events/transactions?ref=${transactionRef}`, 'GET', false, Date.now() - startTime);
      throw error;
    }
  }

  /**
   * List transactions with optional filters
   */
  static async listPayments(params?: {
    limit?: number;
    offset?: number;
    status?: string;
    from_date?: string;
    to_date?: string;
  }): Promise<{ payments: PaypackTransaction[]; total: number }> {
    const startTime = Date.now();

    try {
      const accessToken = await PaypackAuthService.getValidAccessToken();

      const queryParams = new URLSearchParams();
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.offset) queryParams.append('offset', params.offset.toString());
      if (params?.status) queryParams.append('status', params.status);
      if (params?.from_date) queryParams.append('from_date', params.from_date);
      if (params?.to_date) queryParams.append('to_date', params.to_date);

      const endpoint = `/events/transactions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

      const response = await makePaypackRequest<any>(
        endpoint,
        {
          method: 'GET',
          requiresAuth: true,
          accessToken,
        }
      );

      logAPIRequest(endpoint, 'GET', true, Date.now() - startTime);

      // Transform Paypack events response to expected format
      const transactions = response.transactions || [];
      return {
        payments: transactions.map((event: any) => {
          const txData = event.data || {};

          // Map Paypack status to our internal status based on event kind and status
          let mappedStatus = 'pending';
          if (event.event_kind === 'transaction:processed') {
            if (txData.status === 'successful') {
              mappedStatus = 'completed';
            } else if (txData.status === 'failed') {
              // If transaction bounced back, it could be insufficient balance or user cancellation
              mappedStatus = 'insufficient_balance';
            }
          } else if (event.event_kind === 'transaction:created') {
            mappedStatus = 'pending';
          }

          return {
            id: event.event_id || txData.ref || `TXN-${Date.now()}`,
            amount: txData.amount || 0,
            currency: 'RWF', // Paypack primarily uses RWF
            status: mappedStatus,
            reference: txData.ref || '',
            description: `${txData.kind || 'Transaction'} - ${txData.amount || 0} RWF`,
            customer_email: 'N/A',
            customer_phone: txData.client || '',
            created_at: txData.created_at || event.created_at || new Date().toISOString(),
            updated_at: txData.processed_at || event.created_at || new Date().toISOString(),
          };
        }),
        total: response.total || 0
      };
    } catch (error) {
      logAPIRequest('/events/transactions', 'GET', false, Date.now() - startTime);
      throw error;
    }
  }

  /**
   * Cancel a payment
   */
  static async cancelPayment(transactionId: string): Promise<PaypackTransaction> {
    const startTime = Date.now();

    try {
      const accessToken = await PaypackAuthService.getValidAccessToken();

      const response = await makePaypackRequest<PaypackTransaction>(
        `/payments/${transactionId}/cancel`,
        {
          method: 'POST',
          requiresAuth: true,
          accessToken,
        }
      );

      logAPIRequest(`/payments/${transactionId}/cancel`, 'POST', true, Date.now() - startTime);
      return response;
    } catch (error) {
      logAPIRequest(`/payments/${transactionId}/cancel`, 'POST', false, Date.now() - startTime);
      throw error;
    }
  }
}
