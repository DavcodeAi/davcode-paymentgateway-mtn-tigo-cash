// Payment Creation Route

import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import PaymentForm from '~/components/PaymentForm';
import { PaypackPaymentService } from '~/services/paypack-payment.server';
import { PaypackAPIError } from '~/utils/api.server';
import { validateEnvironment } from '~/utils/env.server';
import type { PaymentFormData } from '~/types/paypack';

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
    
    // Extract and validate form data
    const amount = Number(formData.get('amount'));
    const currency = formData.get('currency') as string;
    const description = formData.get('description') as string;
    const customer_email = formData.get('customer_email') as string;
    const customer_phone = formData.get('customer_phone') as string;

    // Basic validation
    if (!amount || amount < 100) {
      return json({ error: 'Amount must be at least 100' }, { status: 400 });
    }

    if (!currency || !description || !customer_email) {
      return json({ error: 'Please fill in all required fields' }, { status: 400 });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customer_email)) {
      return json({ error: 'Please enter a valid email address' }, { status: 400 });
    }

    // Prepare payment request
    const paymentRequest = {
      amount,
      currency,
      description,
      customer_email,
      ...(customer_phone && { customer_phone }),
      reference: `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      callback_url: `${new URL(request.url).origin}/api/payment-webhook`,
      return_url: `${new URL(request.url).origin}/payment/success`,
    };

    // Create payment
    const paymentResponse = await PaypackPaymentService.createPayment(paymentRequest);

    return json({
      success: true,
      transaction_id: paymentResponse.transaction_id,
      payment_url: paymentResponse.payment_url,
      reference: paymentResponse.reference,
    });

  } catch (error) {
    console.error('Payment creation error:', error);
    
    if (error instanceof PaypackAPIError) {
      return json({ 
        error: `Payment failed: ${error.message}` 
      }, { status: error.statusCode });
    }

    return json({ 
      error: 'An unexpected error occurred. Please try again.' 
    }, { status: 500 });
  }
}

export default function CreatePayment() {
  const data = useLoaderData<typeof loader>();

  if ('error' in data) {
    return (
      <div className="container">
        <div className="error-container">
          <h1>Payment Service Unavailable</h1>
          <p>{data.error}</p>
          <p>Please contact the administrator to configure the payment service.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Create Payment</h1>
        <p>Fill in the details below to create a new payment request.</p>
      </div>

      <PaymentForm />

      <div className="info-section">
        <h3>Supported Payment Methods</h3>
        <ul>
          <li>Mobile Money (MTN, Airtel)</li>
          <li>Bank Transfer</li>
          <li>Credit/Debit Cards</li>
        </ul>
        
        <h3>Supported Currencies</h3>
        <ul>
          <li>RWF - Rwandan Franc</li>
          <li>USD - US Dollar</li>
          <li>EUR - Euro</li>
        </ul>
      </div>

      <style jsx>{`
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
        }
        
        .header {
          text-align: center;
          margin-bottom: 2rem;
        }
        
        .header h1 {
          font-size: 2rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }
        
        .header p {
          color: #6b7280;
          font-size: 1.1rem;
        }
        
        .error-container {
          text-align: center;
          padding: 3rem;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          color: #dc2626;
        }
        
        .error-container h1 {
          margin-bottom: 1rem;
        }
        
        .info-section {
          margin-top: 3rem;
          padding: 2rem;
          background: #f9fafb;
          border-radius: 8px;
        }
        
        .info-section h3 {
          color: #374151;
          margin-bottom: 1rem;
          font-weight: 600;
        }
        
        .info-section ul {
          list-style-type: disc;
          margin-left: 1.5rem;
          margin-bottom: 1.5rem;
        }
        
        .info-section li {
          color: #6b7280;
          margin-bottom: 0.5rem;
        }
      `}</style>
    </div>
  );
}
