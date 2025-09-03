// Payment Status Route

import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData, Link } from '@remix-run/react';
import PaymentStatus from '~/components/PaymentStatus';
import { PaypackPaymentService } from '~/services/paypack-payment.server';
import { PaypackAPIError } from '~/utils/api.server';
import type { PaypackTransaction } from '~/types/paypack';

export async function loader({ params }: LoaderFunctionArgs) {
  const { transactionId } = params;

  if (!transactionId) {
    throw new Response('Transaction ID is required', { status: 400 });
  }

  try {
    const transaction = await PaypackPaymentService.getPaymentStatus(transactionId);
    return json({ transaction, success: true });
  } catch (error) {
    console.error('Failed to fetch payment status:', error);
    
    if (error instanceof PaypackAPIError) {
      if (error.statusCode === 404) {
        throw new Response('Payment not found', { status: 404 });
      }
      return json({ 
        error: `Failed to fetch payment: ${error.message}`,
        statusCode: error.statusCode 
      }, { status: error.statusCode });
    }

    return json({ 
      error: 'An unexpected error occurred while fetching payment status' 
    }, { status: 500 });
  }
}

export default function PaymentDetails() {
  const data = useLoaderData<typeof loader>();

  if ('error' in data) {
    return (
      <div className="container">
        <div className="error-container">
          <h1>Error Loading Payment</h1>
          <p>{data.error}</p>
          <Link to="/payment/create" className="back-link">
            Create New Payment
          </Link>
        </div>
      </div>
    );
  }

  const { transaction } = data;

  return (
    <div className="container">
      <div className="header">
        <h1>Payment Details</h1>
        <div className="breadcrumb">
          <Link to="/">Home</Link> / <Link to="/payment/create">Payments</Link> / {transaction.id}
        </div>
      </div>

      <div className="content">
        <PaymentStatus 
          transaction={transaction}
          showDetails={true}
          autoRefresh={transaction.status === 'pending'}
          refreshInterval={5000}
        />

        <div className="actions">
          {transaction.status === 'pending' && (
            <div className="pending-actions">
              <p>This payment is still pending. The status will update automatically.</p>
              <button 
                onClick={() => window.location.reload()} 
                className="refresh-btn"
              >
                Refresh Status
              </button>
            </div>
          )}

          {transaction.status === 'completed' && (
            <div className="success-actions">
              <p>✅ Payment completed successfully!</p>
              <Link to="/payment/create" className="new-payment-btn">
                Create Another Payment
              </Link>
            </div>
          )}

          {transaction.status === 'failed' && (
            <div className="failed-actions">
              <p>❌ Payment failed. You can try creating a new payment.</p>
              <Link to="/payment/create" className="retry-btn">
                Try Again
              </Link>
            </div>
          )}

          {transaction.status === 'cancelled' && (
            <div className="cancelled-actions">
              <p>🚫 Payment was cancelled.</p>
              <Link to="/payment/create" className="new-payment-btn">
                Create New Payment
              </Link>
            </div>
          )}
        </div>

        <div className="additional-info">
          <h3>Need Help?</h3>
          <p>If you have questions about this payment, please contact support with the transaction ID: <code>{transaction.id}</code></p>
        </div>
      </div>

      <style jsx>{`
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
        }
        
        .header {
          margin-bottom: 2rem;
        }
        
        .header h1 {
          font-size: 2rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }
        
        .breadcrumb {
          color: #6b7280;
          font-size: 0.875rem;
        }
        
        .breadcrumb a {
          color: #3b82f6;
          text-decoration: none;
        }
        
        .breadcrumb a:hover {
          text-decoration: underline;
        }
        
        .content {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        
        .actions {
          padding: 1.5rem;
          border-radius: 8px;
          text-align: center;
        }
        
        .pending-actions {
          background: #fef3c7;
          border: 1px solid #f59e0b;
          color: #92400e;
        }
        
        .success-actions {
          background: #d1fae5;
          border: 1px solid #10b981;
          color: #065f46;
        }
        
        .failed-actions {
          background: #fee2e2;
          border: 1px solid #ef4444;
          color: #991b1b;
        }
        
        .cancelled-actions {
          background: #f3f4f6;
          border: 1px solid #6b7280;
          color: #374151;
        }
        
        .refresh-btn, .new-payment-btn, .retry-btn {
          margin-top: 1rem;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          font-weight: 500;
          text-decoration: none;
          display: inline-block;
          cursor: pointer;
        }
        
        .refresh-btn {
          background: #3b82f6;
          color: white;
        }
        
        .new-payment-btn {
          background: #10b981;
          color: white;
        }
        
        .retry-btn {
          background: #ef4444;
          color: white;
        }
        
        .additional-info {
          padding: 1.5rem;
          background: #f9fafb;
          border-radius: 8px;
        }
        
        .additional-info h3 {
          margin-bottom: 1rem;
          color: #374151;
        }
        
        .additional-info code {
          background: #e5e7eb;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-family: monospace;
        }
        
        .error-container {
          text-align: center;
          padding: 3rem;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          color: #dc2626;
        }
        
        .back-link {
          display: inline-block;
          margin-top: 1rem;
          padding: 0.5rem 1rem;
          background: #3b82f6;
          color: white;
          text-decoration: none;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}
