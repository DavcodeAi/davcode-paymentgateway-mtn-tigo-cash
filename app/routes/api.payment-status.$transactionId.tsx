// API Route for Payment Status

import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { PaypackPaymentService } from '~/services/paypack-payment.server';
import { PaypackAPIError } from '~/utils/api.server';

export async function loader({ params }: LoaderFunctionArgs) {
  const { transactionId } = params;

  if (!transactionId) {
    return json({ error: 'Transaction ID is required' }, { status: 400 });
  }

  try {
    const transaction = await PaypackPaymentService.getPaymentStatus(transactionId);
    return json(transaction);
  } catch (error) {
    console.error('API: Failed to fetch payment status:', error);

    if (error instanceof PaypackAPIError) {
      return json({
        error: error.message,
        code: error.error
      }, { status: error.statusCode });
    }

    return json({
      error: 'Internal server error'
    }, { status: 500 });
  }
}
