# Paypack Integration Template

A simple Remix template with Paypack integration for African payment solutions. Handle cashin (deposits), cashout (withdrawals), and transaction management with ease.

## Features

- 💰 **Cash In**: Deposit money using mobile money, bank transfers, or cards
- 💸 **Cash Out**: Withdraw money to mobile money or bank accounts
- 📊 **Transaction Management**: View and track all transactions with real-time status
- 🔒 **Secure Authentication**: JWT-based authentication with automatic token refresh
- 📱 **Mobile Money Support**: MTN Mobile Money, Airtel Money integration
- 🌍 **Multi-Currency**: Support for RWF, USD, and EUR
- 🔔 **Webhook Integration**: Real-time payment status updates

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd netlify-remix-app-for-davcode-master-main
npm install
```

### 2. Environment Setup

Copy the example environment file and configure your Paypack credentials:

```bash
cp .env.example .env
```

Edit `.env` with your Paypack credentials:

```env
# Paypack Configuration
PAYPACK_BASE_URL=https://payments.paypack.rw/api
PAYPACK_CLIENT_ID=your_client_id_here
PAYPACK_CLIENT_SECRET=your_client_secret_here

# Application Configuration
SESSION_SECRET=your_session_secret_here
NODE_ENV=development
```

### 3. Get Paypack Credentials

1. Visit [Paypack Dashboard](https://payments.paypack.rw)
2. Create an account or log in
3. Create a new application
4. Copy your `client_id` and `client_secret`
5. **Important**: The `client_secret` is only shown once, so save it immediately

### 4. Run the Application

```bash
npm run dev
```

Visit `http://localhost:3000` to see your application.

## Usage

### Cash In (Deposits)

Navigate to `/cashin` to deposit money:
- Enter amount and currency
- Provide email and phone number
- Choose payment method (Mobile Money, Bank Transfer, Card)
- Complete payment through Paypack's secure interface

### Cash Out (Withdrawals)

Navigate to `/cashout` to withdraw money:
- Enter withdrawal amount and currency
- Select withdrawal method (Mobile Money or Bank Transfer)
- Provide contact details
- Submit withdrawal request for processing

### View Transactions

Navigate to `/transactions` to:
- View all payment transactions
- Filter by status (pending, completed, failed, cancelled)
- See transaction details and references
- Track payment status in real-time

## API Endpoints

### Payment Routes
- `POST /cashin` - Create deposit transaction
- `POST /cashout` - Create withdrawal request
- `GET /transactions` - List all transactions
- `GET /payment/:transactionId` - Get specific transaction details

### API Routes
- `GET /api/payment-status/:transactionId` - Get transaction status (JSON)
- `POST /api/payment-webhook` - Webhook endpoint for Paypack notifications

## Development

### Project Structure

```
app/
├── components/           # React components
│   ├── PaymentForm.tsx
│   ├── PaymentStatus.tsx
│   └── TransactionList.tsx
├── routes/              # Remix routes
│   ├── _index.tsx       # Homepage
│   ├── cashin.tsx       # Cash in page
│   ├── cashout.tsx      # Cash out page
│   ├── transactions.tsx # Transactions list
│   └── api/            # API routes
├── services/           # Business logic
│   ├── paypack-auth.server.ts
│   └── paypack-payment.server.ts
├── types/              # TypeScript types
│   └── paypack.ts
└── utils/              # Utilities
    ├── env.server.ts
    └── api.server.ts
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PAYPACK_CLIENT_ID` | Your Paypack application client ID | Yes |
| `PAYPACK_CLIENT_SECRET` | Your Paypack application client secret | Yes |
| `PAYPACK_BASE_URL` | Paypack API base URL | No (defaults to production) |
| `SESSION_SECRET` | Secret for session encryption | Yes |
| `NODE_ENV` | Environment (development/production) | No |

### Webhook Configuration

To receive real-time payment updates, configure your webhook URL in the Paypack dashboard:

```
https://yourdomain.com/api/payment-webhook
```

The webhook will receive notifications for:
- `payment.completed` - Payment successfully processed
- `payment.failed` - Payment failed
- `payment.cancelled` - Payment cancelled by user

## Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Netlify

This template is configured for Netlify deployment:

1. Connect your repository to Netlify
2. Set environment variables in Netlify dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production

Make sure to set these in your production environment:

```env
PAYPACK_CLIENT_ID=your_production_client_id
PAYPACK_CLIENT_SECRET=your_production_client_secret
SESSION_SECRET=your_secure_session_secret
NODE_ENV=production
```

## Customization

### Adding New Payment Types

1. Create new route in `app/routes/`
2. Use existing services in `app/services/`
3. Add new components in `app/components/` if needed

### Styling

The template uses inline styles with CSS-in-JS. You can:
- Replace with your preferred CSS framework
- Use Tailwind CSS
- Add global CSS files

### Database Integration

Currently, transactions are managed through Paypack API. To add local storage:

1. Add database client (Prisma, etc.)
2. Create transaction models
3. Update webhook handler to store transactions locally

## Support

### Paypack Documentation
- [Paypack API Docs](https://developer.paypack.rw)
- [Authentication Guide](https://developer.paypack.rw/docs/authentication)

### Common Issues

**Environment Variables Not Loading**
- Make sure `.env` file is in project root
- Restart development server after changes
- Check for typos in variable names

**Authentication Errors**
- Verify client_id and client_secret are correct
- Check if credentials are for correct environment (test/production)
- Ensure application has proper permissions in Paypack dashboard

**Webhook Not Receiving Events**
- Verify webhook URL is publicly accessible
- Check webhook URL in Paypack dashboard
- Ensure webhook endpoint returns 200 status

## License

This project is open source and available under the [MIT License](LICENSE).
