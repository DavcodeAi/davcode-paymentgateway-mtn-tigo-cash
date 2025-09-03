// Transactions Route

import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData, useSearchParams, Link } from '@remix-run/react';
import { PaypackPaymentService } from '~/services/paypack-payment.server';
import { PaypackAPIError } from '~/utils/api.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '10');
  const status = url.searchParams.get('status') || undefined;
  const offset = (page - 1) * limit;

  try {
    const result = await PaypackPaymentService.listPayments({
      limit,
      offset,
      status,
    });

    const totalPages = Math.ceil(result.total / limit);

    return json({
      transactions: result.payments,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: result.total,
        itemsPerPage: limit,
      },
      filters: { status },
      success: true,
    });
  } catch (error) {
    console.error('Failed to fetch transactions:', error);

    // Return empty state instead of error for better UX
    return json({
      transactions: [],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: limit,
      },
      filters: { status },
      success: true,
      warning: 'Unable to fetch transactions from Paypack API. This may be due to network issues or API limitations.'
    });
  }
}

export default function Transactions() {
  const data = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

  const { transactions, pagination, filters, warning } = data;

  const handleStatusFilter = (status: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (status === 'all') {
      newParams.delete('status');
    } else {
      newParams.set('status', status);
    }
    newParams.delete('page');
    setSearchParams(newParams);
  };

  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'status-completed';
      case 'pending': return 'status-pending';
      case 'failed': return 'status-failed';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-unknown';
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-RW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="transactions-page">
      <div className="container">
        <header className="header">
          <Link to="/" className="back-link">← Back to Home</Link>
          <h1>Transactions</h1>
          <p>View and manage all your payment transactions</p>
        </header>

        <div className="actions">
          <Link to="/cashin" className="action-button cashin">Cash In</Link>
          <Link to="/cashout" className="action-button cashout">Cash Out</Link>
        </div>

        <div className="filters">
          <label>Filter by Status:</label>
          <select
            value={filters.status || 'all'}
            onChange={(e) => handleStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {warning && (
          <div className="warning-message">
            <strong>⚠️ Notice:</strong> {warning}
          </div>
        )}

        {transactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💳</div>
            <h3>No transactions found</h3>
            {warning ? (
              <p>Unable to load transactions from Paypack API. Your transactions will appear here once the API connection is restored.</p>
            ) : (
              <p>You haven't made any transactions yet.</p>
            )}
            <div className="empty-actions">
              <Link to="/cashin" className="action-button cashin">Make a Deposit</Link>
              <Link to="/cashout" className="action-button cashout">Request Withdrawal</Link>
            </div>
          </div>
        ) : (
          <>
            <div className="transactions-list">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="transaction-card">
                  <div className="transaction-header">
                    <div className="transaction-id">
                      ID: {transaction.id.substring(0, 8)}...
                    </div>
                    <div className={`transaction-status ${getStatusColor(transaction.status)}`}>
                      {transaction.status.toUpperCase()}
                    </div>
                  </div>

                  <div className="transaction-amount">
                    {formatAmount(transaction.amount, transaction.currency)}
                  </div>

                  <div className="transaction-description">
                    {transaction.description || 'No description'}
                  </div>

                  <div className="transaction-date">
                    {formatDate(transaction.created_at)}
                  </div>

                  {transaction.reference && (
                    <div className="transaction-reference">
                      Ref: {transaction.reference}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage <= 1}
                  className="pagination-btn"
                >
                  Previous
                </button>

                <span className="pagination-info">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>

                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage >= pagination.totalPages}
                  className="pagination-btn"
                >
                  Next
                </button>
              </div>
            )}

            <div className="summary">
              <p>
                Showing {transactions.length} of {pagination.totalItems} transactions
                {filters.status && ` (filtered by: ${filters.status})`}
              </p>
            </div>
          </>
        )}
      </div>

      <style>{`
        .transactions-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 2rem 0;
        }
        
        .container {
          max-width: 800px;
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
        
        .actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-bottom: 2rem;
        }
        
        .action-button {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          transition: transform 0.2s;
        }
        
        .action-button:hover {
          transform: translateY(-2px);
        }
        
        .action-button.cashin {
          background: #10b981;
          color: white;
        }
        
        .action-button.cashout {
          background: #f5576c;
          color: white;
        }
        
        .filters {
          background: white;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 2rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .filters label {
          font-weight: 600;
          color: #374151;
        }
        
        .filters select {
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 4px;
        }

        .warning-message {
          background: #fef3c7;
          border: 1px solid #f59e0b;
          color: #92400e;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 2rem;
        }
        
        .transactions-list {
          display: grid;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        
        .transaction-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .transaction-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        
        .transaction-id {
          font-family: monospace;
          font-size: 0.875rem;
          color: #6b7280;
        }
        
        .transaction-status {
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        
        .status-completed { background: #d1fae5; color: #065f46; }
        .status-pending { background: #fef3c7; color: #92400e; }
        .status-failed { background: #fee2e2; color: #991b1b; }
        .status-cancelled { background: #f3f4f6; color: #374151; }
        
        .transaction-amount {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }
        
        .transaction-description {
          color: #6b7280;
          margin-bottom: 0.5rem;
        }
        
        .transaction-date {
          font-size: 0.875rem;
          color: #9ca3af;
        }
        
        .transaction-reference {
          font-family: monospace;
          font-size: 0.75rem;
          color: #6b7280;
          margin-top: 0.5rem;
        }
        
        .empty-state {
          background: white;
          border-radius: 16px;
          padding: 3rem;
          text-align: center;
        }
        
        .empty-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }
        
        .empty-state h3 {
          color: #374151;
          margin-bottom: 0.5rem;
        }
        
        .empty-state p {
          color: #6b7280;
          margin-bottom: 2rem;
        }
        
        .empty-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }
        
        .pagination {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: white;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
        }
        
        .pagination-btn {
          padding: 0.5rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          background: white;
          cursor: pointer;
        }
        
        .pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .pagination-info {
          color: #6b7280;
        }
        
        .summary {
          text-align: center;
          color: white;
          opacity: 0.8;
        }
        
        .error-container {
          background: white;
          border-radius: 16px;
          padding: 3rem;
          text-align: center;
          color: #dc2626;
        }
      `}</style>
    </div>
  );
}
