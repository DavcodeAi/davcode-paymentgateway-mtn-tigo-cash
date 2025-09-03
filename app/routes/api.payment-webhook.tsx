// Webhook Handler for Payment Notifications

import type { ActionFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import type { PaypackWebhookPayload } from '~/types/paypack';

export async function action({ request }: ActionFunctionArgs) {
  // Only accept POST requests
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const payload: PaypackWebhookPayload = await request.json();
    
    // Log the webhook for debugging
    console.log('Received webhook:', {
      event: payload.event,
      transaction_id: payload.data.id,
      status: payload.data.status,
      timestamp: payload.timestamp,
    });

    // Handle different webhook events
    switch (payload.event) {
      case 'payment.completed':
        await handlePaymentCompleted(payload.data);
        break;
        
      case 'payment.failed':
        await handlePaymentFailed(payload.data);
        break;
        
      case 'payment.cancelled':
        await handlePaymentCancelled(payload.data);
        break;
        
      default:
        console.warn('Unknown webhook event:', payload.event);
    }

    // Return success response to Paypack
    return json({ success: true, message: 'Webhook processed successfully' });

  } catch (error) {
    console.error('Webhook processing error:', error);
    
    // Return error response
    return json({ 
      error: 'Failed to process webhook',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function handlePaymentCompleted(transaction: any) {
  console.log(`✅ Payment completed: ${transaction.id}`);
  
  // Here you would typically:
  // 1. Update your database
  // 2. Send confirmation emails
  // 3. Trigger fulfillment processes
  // 4. Update user accounts
  
  // Example implementation:
  try {
    // Update database (pseudo-code)
    // await db.transaction.update({
    //   where: { id: transaction.id },
    //   data: { 
    //     status: 'completed',
    //     completed_at: new Date(),
    //     updated_at: new Date()
    //   }
    // });

    // Send confirmation email (pseudo-code)
    // if (transaction.customer_email) {
    //   await sendPaymentConfirmationEmail({
    //     to: transaction.customer_email,
    //     transaction: transaction
    //   });
    // }

    console.log(`Payment ${transaction.id} processing completed`);
  } catch (error) {
    console.error(`Failed to process completed payment ${transaction.id}:`, error);
  }
}

async function handlePaymentFailed(transaction: any) {
  console.log(`❌ Payment failed: ${transaction.id}`);
  
  // Here you would typically:
  // 1. Update your database
  // 2. Send failure notifications
  // 3. Log for analysis
  
  try {
    // Update database (pseudo-code)
    // await db.transaction.update({
    //   where: { id: transaction.id },
    //   data: { 
    //     status: 'failed',
    //     failed_at: new Date(),
    //     updated_at: new Date()
    //   }
    // });

    // Send failure notification (pseudo-code)
    // if (transaction.customer_email) {
    //   await sendPaymentFailureEmail({
    //     to: transaction.customer_email,
    //     transaction: transaction
    //   });
    // }

    console.log(`Payment ${transaction.id} failure processing completed`);
  } catch (error) {
    console.error(`Failed to process failed payment ${transaction.id}:`, error);
  }
}

async function handlePaymentCancelled(transaction: any) {
  console.log(`🚫 Payment cancelled: ${transaction.id}`);
  
  // Here you would typically:
  // 1. Update your database
  // 2. Release reserved inventory
  // 3. Send cancellation notifications
  
  try {
    // Update database (pseudo-code)
    // await db.transaction.update({
    //   where: { id: transaction.id },
    //   data: { 
    //     status: 'cancelled',
    //     cancelled_at: new Date(),
    //     updated_at: new Date()
    //   }
    // });

    // Release inventory (pseudo-code)
    // if (transaction.items) {
    //   await releaseInventory(transaction.items);
    // }

    console.log(`Payment ${transaction.id} cancellation processing completed`);
  } catch (error) {
    console.error(`Failed to process cancelled payment ${transaction.id}:`, error);
  }
}

// Handle GET requests (for webhook verification if needed)
export async function loader() {
  return json({ 
    message: 'Paypack webhook endpoint',
    status: 'active',
    timestamp: new Date().toISOString()
  });
}
