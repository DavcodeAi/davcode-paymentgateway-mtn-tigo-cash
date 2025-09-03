// Payment Form Component

import { Form, useActionData, useNavigation } from '@remix-run/react';
import type { PaymentFormData } from '~/types/paypack';

interface PaymentFormProps {
  defaultValues?: Partial<PaymentFormData>;
  submitText?: string;
  className?: string;
}

interface ActionData {
  error?: string;
  success?: boolean;
  transaction_id?: string;
  payment_url?: string;
}

export default function PaymentForm({
  defaultValues = {},
  submitText = 'Pay Now',
  className = '',
}: PaymentFormProps) {
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <div className={`payment-form ${className}`}>
      <Form method="post" className="space-y-4">
        <div className="form-group">
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
            Amount *
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            required
            min="100"
            step="1"
            defaultValue={defaultValues.amount}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Enter amount in RWF"
          />
        </div>

        <div className="form-group">
          <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
            Currency
          </label>
          <select
            id="currency"
            name="currency"
            defaultValue={defaultValues.currency || 'RWF'}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="RWF">RWF - Rwandan Franc</option>
            <option value="USD">USD - US Dollar</option>
            <option value="EUR">EUR - Euro</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description *
          </label>
          <input
            type="text"
            id="description"
            name="description"
            required
            defaultValue={defaultValues.description}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Payment description"
          />
        </div>

        <div className="form-group">
          <label htmlFor="customer_email" className="block text-sm font-medium text-gray-700">
            Customer Email *
          </label>
          <input
            type="email"
            id="customer_email"
            name="customer_email"
            required
            defaultValue={defaultValues.customer_email}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="customer@example.com"
          />
        </div>

        <div className="form-group">
          <label htmlFor="customer_phone" className="block text-sm font-medium text-gray-700">
            Customer Phone
          </label>
          <input
            type="tel"
            id="customer_phone"
            name="customer_phone"
            defaultValue={defaultValues.customer_phone}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="+250788123456"
          />
        </div>

        {actionData?.error && (
          <div className="error-message bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <strong>Error:</strong> {actionData.error}
          </div>
        )}

        {actionData?.success && actionData.payment_url && (
          <div className="success-message bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            <strong>Success!</strong> Payment created successfully.
            <br />
            <a
              href={actionData.payment_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 underline hover:text-green-800"
            >
              Complete Payment →
            </a>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Processing...' : submitText}
        </button>
      </Form>

      <style jsx>{`
        .payment-form {
          max-width: 500px;
          margin: 0 auto;
          padding: 2rem;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .form-group {
          margin-bottom: 1rem;
        }
        
        .space-y-4 > * + * {
          margin-top: 1rem;
        }
      `}</style>
    </div>
  );
}
