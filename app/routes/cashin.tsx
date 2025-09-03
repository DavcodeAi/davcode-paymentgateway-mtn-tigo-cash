// Cash In (Deposit) Route

import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, useActionData, useNavigation, Link } from '@remix-run/react';
import { PaypackPaymentService } from '~/services/paypack-payment.server';
import { PaypackAPIError } from '~/utils/api.server';
import { validateEnvironment } from '~/utils/env.server';
import { useState, useEffect } from 'react';

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    validateEnvironment();
    return json({ success: true });
  } catch (error) {
    return json({
      error: 'Payment service is not properly configured. Please check environment variables.'
    }, { status: 500 });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.formData();

    const amount = Number(formData.get('amount'));
    const currency = 'RWF'; // Fixed to RWF only
    const customer_phone = formData.get('customer_phone') as string;

    // Validation
    if (!amount || amount < 100) {
      return json({ error: 'Amount must be at least 100 RWF' }, { status: 400 });
    }

    if (!customer_phone) {
      return json({ error: 'Phone number is required' }, { status: 400 });
    }

    // Phone validation - Rwanda format
    const phoneRegex = /^(\+?250|0)?[7][0-9]{8}$/;
    if (!phoneRegex.test(customer_phone)) {
      return json({ error: 'Please enter a valid Rwandan phone number (e.g., +250788123456 or 0788123456)' }, { status: 400 });
    }

    // Normalize phone number to international format
    let normalizedPhone = customer_phone.replace(/\s+/g, '');
    if (normalizedPhone.startsWith('0')) {
      normalizedPhone = '+250' + normalizedPhone.substring(1);
    } else if (!normalizedPhone.startsWith('+')) {
      normalizedPhone = '+250' + normalizedPhone;
    }

    // Create cashin payment
    const paymentRequest = {
      amount,
      currency,
      description: `Cash In - Deposit ${amount} ${currency}`,
      customer_phone: normalizedPhone,
      reference: `CASHIN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      callback_url: `${new URL(request.url).origin}/api/payment-webhook`,
      return_url: `${new URL(request.url).origin}/transactions`,
    };

    const paymentResponse = await PaypackPaymentService.createPayment(paymentRequest);

    // Return success with transaction details - no redirect
    return json({
      success: true,
      message: 'Payment request sent! Please check your phone for the mobile money prompt.',
      transaction_id: paymentResponse.transaction_id,
      reference: paymentResponse.reference,
      status: 'pending',
      amount: amount,
      currency: currency,
      phone: customer_phone
    });

  } catch (error) {
    console.error('Cashin error:', error);

    if (error instanceof PaypackAPIError) {
      return json({
        error: `Cashin failed: ${error.message}`
      }, { status: error.statusCode });
    }

    return json({
      error: 'An unexpected error occurred. Please try again.'
    }, { status: 500 });
  }
}

export default function CashIn() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  // If payment was successful, show payment status instead of form
  if (actionData?.success && actionData?.transaction_id) {
    return <PaymentStatusPage actionData={actionData} />;
  }

  return (
    <div className="cashin-page">
      <div className="container">
        <header className="header">
          <Link to="/" className="back-link">← Back to Home</Link>
          <h1>Cash In (Deposit)</h1>
          <p>Deposit money to your account using mobile money, bank transfer, or card.</p>
        </header>

        <div className="form-container">
          <Form method="post" className="cashin-form">
            <div className="form-group">
              <label htmlFor="amount">Amount (RWF) *</label>
              <input
                type="number"
                id="amount"
                name="amount"
                required
                min="100"
                step="1"
                placeholder="Enter amount in RWF (minimum 100)"
              />
              <small>Minimum deposit: 100 RWF</small>
            </div>

            <div className="form-group">
              <label htmlFor="customer_phone">Phone Number *</label>
              <input
                type="tel"
                id="customer_phone"
                name="customer_phone"
                required
                placeholder="0788123456 or +250788123456"
              />
              <small>Enter your MTN or Airtel mobile money number (must have sufficient balance)</small>
            </div>

            {actionData?.error && (
              <div className="error-message">
                <strong>Error:</strong> {actionData.error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="submit-button"
            >
              {isSubmitting ? 'Processing...' : 'Deposit Money'}
            </button>
          </Form>

          <div className="info-section">
            <h3>Supported Payment Methods</h3>
            <ul>
              <li>📱 MTN Mobile Money (Rwanda)</li>
              <li>📱 Airtel Money (Rwanda)</li>
            </ul>

            <div className="requirements">
              <h4>Requirements:</h4>
              <ul>
                <li>✅ Valid Rwandan mobile money account</li>
                <li>✅ Sufficient balance in your mobile money account</li>
                <li>✅ Active mobile money PIN</li>
              </ul>
            </div>

            <div className="security-note">
              <p>🔒 All transactions are secured with bank-level encryption</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .cashin-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 2rem 0;
        }
        
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 0 2rem;
        }
        
        .header {
          text-align: center;
          color: white;
          margin-bottom: 2rem;
        }
        
        .back-link {
          color: white;
          text-decoration: none;
          margin-bottom: 1rem;
          display: inline-block;
          opacity: 0.8;
        }
        
        .back-link:hover {
          opacity: 1;
        }
        
        .header h1 {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }
        
        .header p {
          font-size: 1.1rem;
          opacity: 0.9;
        }
        
        .form-container {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        
        .cashin-form {
          margin-bottom: 2rem;
        }
        
        .form-group {
          margin-bottom: 1.5rem;
        }
        
        .form-group label {
          display: block;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
        }
        
        .form-group input,
        .form-group select {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.2s;
        }
        
        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #3b82f6;
        }
        
        .error-message {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
        }
        
        .submit-button {
          width: 100%;
          background: #10b981;
          color: white;
          padding: 1rem;
          border: none;
          border-radius: 8px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .submit-button:hover:not(:disabled) {
          background: #059669;
        }
        
        .submit-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .info-section {
          border-top: 1px solid #e5e7eb;
          padding-top: 2rem;
        }
        
        .info-section h3 {
          color: #374151;
          margin-bottom: 1rem;
        }
        
        .info-section ul {
          list-style: none;
          padding: 0;
          margin-bottom: 1.5rem;
        }
        
        .info-section li {
          padding: 0.5rem 0;
          color: #6b7280;
        }

        .requirements {
          margin: 1.5rem 0;
          padding: 1rem;
          background: #fffbeb;
          border: 1px solid #fed7aa;
          border-radius: 8px;
        }

        .requirements h4 {
          color: #92400e;
          margin-bottom: 0.5rem;
        }

        .requirements ul {
          margin: 0;
          padding-left: 1rem;
        }

        .requirements li {
          color: #92400e;
          list-style-type: none;
          padding: 0.25rem 0;
        }

        .security-note {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          padding: 1rem;
          border-radius: 8px;
          text-align: center;
        }

        .security-note p {
          margin: 0;
          color: #166534;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}

// Payment Status Component for monitoring payment progress
function PaymentStatusPage({ actionData }: { actionData: any }) {
  const [status, setStatus] = useState('pending');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!actionData?.transaction_id) return;

    const checkPaymentStatus = async () => {
      try {
        const response = await fetch(`/api/payment-status/${actionData.transaction_id}`);
        if (response.ok) {
          const data = await response.json();
          setStatus(data.status);

          if (data.status === 'completed' || data.status === 'failed' || data.status === 'cancelled') {
            setIsChecking(false);
          }
        }
      } catch (error) {
        console.error('Failed to check payment status:', error);
      }
    };

    // Check immediately
    checkPaymentStatus();

    // Then check every 5 seconds if still pending
    const interval = setInterval(() => {
      if (status === 'pending' && timeElapsed < 300) { // Stop after 5 minutes
        checkPaymentStatus();
      } else if (timeElapsed >= 120 && status === 'pending') {
        // After 2 minutes, show as potentially failed but keep checking
        setStatus('timeout');
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [actionData?.transaction_id, status, timeElapsed]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'pending':
        if (timeElapsed < 30) {
          return 'Sending payment request to your phone...';
        } else if (timeElapsed < 120) {
          return 'Please check your phone and complete the mobile money payment.';
        } else {
          return 'Still waiting for payment confirmation. Please complete the payment on your phone.';
        }
      case 'timeout':
        return 'Payment is taking longer than expected. Please complete the payment on your phone or try again.';
      case 'completed':
        return '✅ Payment completed successfully!';
      case 'failed':
        return '❌ Payment failed. Please try again.';
      case 'cancelled':
        return '🚫 Payment was cancelled.';
      default:
        return 'Checking payment status...';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'failed': return '#ef4444';
      case 'cancelled': return '#6b7280';
      case 'timeout': return '#f59e0b';
      default: return '#3b82f6';
    }
  };

  return (
    <div className="payment-status-page">
      <div className="container">
        <header className="header">
          <h1>Cash In Status</h1>
          <p>Transaction: {actionData.reference}</p>
        </header>

        <div className="status-container">
          <div className="status-circle" style={{ borderColor: getStatusColor() }}>
            {status === 'pending' || status === 'timeout' ? (
              <div className="spinner"></div>
            ) : status === 'completed' ? (
              <div className="checkmark">✓</div>
            ) : status === 'failed' ? (
              <div className="cross">✗</div>
            ) : (
              <div className="question">?</div>
            )}
          </div>

          <div className="status-info">
            <h2>{getStatusMessage()}</h2>
            <div className="transaction-details">
              <p><strong>Amount:</strong> {actionData.amount} {actionData.currency}</p>
              <p><strong>Phone:</strong> {actionData.phone}</p>
              <p><strong>Time elapsed:</strong> {formatTime(timeElapsed)}</p>
            </div>
          </div>

          {(status === 'pending' || status === 'timeout') && (
            <div className="instructions">
              <h3>📱 Complete Payment on Your Phone</h3>
              <ol>
                <li>Check your phone for an MTN/Airtel mobile money prompt</li>
                <li>Enter your mobile money PIN</li>
                <li>Confirm the payment</li>
                <li>Wait for confirmation SMS</li>
              </ol>
            </div>
          )}

          <div className="actions">
            {status === 'completed' && (
              <Link to="/transactions" className="action-btn success">
                View Transactions
              </Link>
            )}

            {(status === 'failed' || status === 'cancelled' || (status === 'timeout' && timeElapsed > 300)) && (
              <Link to="/cashin" className="action-btn retry">
                Try Again
              </Link>
            )}

            <Link to="/" className="action-btn secondary">
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .payment-status-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 2rem 0;
        }

        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .header {
          text-align: center;
          color: white;
          margin-bottom: 2rem;
        }

        .header h1 {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .status-container {
          background: white;
          border-radius: 16px;
          padding: 3rem 2rem;
          text-align: center;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }

        .status-circle {
          width: 120px;
          height: 120px;
          border: 4px solid;
          border-radius: 50%;
          margin: 0 auto 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
          position: relative;
        }

        .spinner {
          width: 60px;
          height: 60px;
          border: 4px solid #e5e7eb;
          border-top: 4px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .checkmark {
          color: #10b981;
          font-weight: bold;
        }

        .cross {
          color: #ef4444;
          font-weight: bold;
        }

        .question {
          color: #6b7280;
          font-weight: bold;
        }

        .status-info h2 {
          color: #1f2937;
          margin-bottom: 1.5rem;
          font-size: 1.5rem;
        }

        .transaction-details {
          background: #f9fafb;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 2rem;
          text-align: left;
        }

        .transaction-details p {
          margin: 0.5rem 0;
          color: #374151;
        }

        .instructions {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          padding: 1.5rem;
          border-radius: 8px;
          margin-bottom: 2rem;
          text-align: left;
        }

        .instructions h3 {
          color: #1e40af;
          margin-bottom: 1rem;
        }

        .instructions ol {
          color: #1e40af;
          padding-left: 1.5rem;
        }

        .instructions li {
          margin-bottom: 0.5rem;
        }

        .actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .action-btn {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          transition: transform 0.2s;
        }

        .action-btn:hover {
          transform: translateY(-2px);
        }

        .action-btn.success {
          background: #10b981;
          color: white;
        }

        .action-btn.retry {
          background: #ef4444;
          color: white;
        }

        .action-btn.secondary {
          background: #6b7280;
          color: white;
        }
      `}</style>
    </div>
  );
}
