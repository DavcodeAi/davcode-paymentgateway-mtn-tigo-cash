// Transaction List Component

import { Link } from '@remix-run/react';
import type { PaypackTransaction } from '~/types/paypack';

interface TransactionListProps {
  transactions: PaypackTransaction[];
  showPagination?: boolean;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export default function TransactionList({
  transactions,
  showPagination = false,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}: TransactionListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      case 'cancelled':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
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

  if (transactions.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">💳</div>
        <h3>No transactions found</h3>
        <p>There are no transactions to display at the moment.</p>
      </div>
    );
  }

  return (
    <div className="transaction-list">
      <div className="table-container">
        <table className="transactions-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Description</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td className="transaction-id">
                  {transaction.id.substring(0, 8)}...
                </td>
                <td className="amount">
                  {formatAmount(transaction.amount, transaction.currency)}
                </td>
                <td>
                  <span className={`status-badge ${getStatusColor(transaction.status)}`}>
                    {transaction.status}
                  </span>
                </td>
                <td className="description">
                  {transaction.description || 'No description'}
                </td>
                <td className="date">
                  {formatDate(transaction.created_at)}
                </td>
                <td className="actions">
                  <Link
                    to={`/payment/${transaction.id}`}
                    className="view-link"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showPagination && totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => onPageChange?.(currentPage - 1)}
            disabled={currentPage <= 1}
            className="pagination-btn"
          >
            Previous
          </button>
          
          <span className="pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => onPageChange?.(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      )}

      <style jsx>{`
        .transaction-list {
          background: white;
          border-radius: 8px;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        
        .table-container {
          overflow-x: auto;
        }
        
        .transactions-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .transactions-table th,
        .transactions-table td {
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .transactions-table th {
          background-color: #f9fafb;
          font-weight: 600;
          color: #374151;
        }
        
        .transaction-id {
          font-family: monospace;
          font-size: 0.875rem;
        }
        
        .amount {
          font-weight: 600;
          color: #1f2937;
        }
        
        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }
        
        .description {
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .date {
          font-size: 0.875rem;
          color: #6b7280;
        }
        
        .view-link {
          color: #3b82f6;
          text-decoration: none;
          font-weight: 500;
        }
        
        .view-link:hover {
          text-decoration: underline;
        }
        
        .pagination {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-top: 1px solid #e5e7eb;
          background-color: #f9fafb;
        }
        
        .pagination-btn {
          padding: 0.5rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          background: white;
          color: #374151;
          cursor: pointer;
        }
        
        .pagination-btn:hover:not(:disabled) {
          background-color: #f3f4f6;
        }
        
        .pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .pagination-info {
          font-size: 0.875rem;
          color: #6b7280;
        }
        
        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #6b7280;
        }
        
        .empty-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }
        
        .empty-state h3 {
          margin: 0 0 0.5rem 0;
          color: #374151;
        }
      `}</style>
    </div>
  );
}
