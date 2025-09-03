// Payment Status Component

import { useEffect, useState } from 'react';
import type { PaypackTransaction } from '~/types/paypack';

interface PaymentStatusProps {
  transaction: PaypackTransaction;
  showDetails?: boolean;
  onStatusChange?: (status: string) => void;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export default function PaymentStatus({
  transaction,
  showDetails = true,
  onStatusChange,
  autoRefresh = false,
  refreshInterval = 5000,
}: PaymentStatusProps) {
  const [currentTransaction, setCurrentTransaction] = useState(transaction);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (autoRefresh && (currentTransaction.status === 'pending')) {
      const interval = setInterval(async () => {
        setIsRefreshing(true);
        try {
          const response = await fetch(`/api/payment-status/${currentTransaction.id}`);
          if (response.ok) {
            const updatedTransaction = await response.json();
            setCurrentTransaction(updatedTransaction);
            if (onStatusChange && updatedTransaction.status !== currentTransaction.status) {
              onStatusChange(updatedTransaction.status);
            }
          }
        } catch (error) {
          console.error('Failed to refresh payment status:', error);
        } finally {
          setIsRefreshing(false);
        }
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [currentTransaction.status, autoRefresh, refreshInterval, onStatusChange]);

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'pending':
        return '⏳';
      case 'failed':
        return '❌';
      case 'cancelled':
        return '🚫';
      default:
        return '❓';
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
    return new Date(dateString).toLocaleString('en-RW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="payment-status">
      <div className="status-header">
        <div className={`status-badge ${getStatusColor(currentTransaction.status)}`}>
          <span className="status-icon">{getStatusIcon(currentTransaction.status)}</span>
          <span className="status-text">{currentTransaction.status.toUpperCase()}</span>
          {isRefreshing && <span className="refresh-indicator">🔄</span>}
        </div>
        <div className="amount">
          {formatAmount(currentTransaction.amount, currentTransaction.currency)}
        </div>
      </div>

      {showDetails && (
        <div className="status-details">
          <div className="detail-row">
            <span className="detail-label">Transaction ID:</span>
            <span className="detail-value">{currentTransaction.id}</span>
          </div>
          
          {currentTransaction.reference && (
            <div className="detail-row">
              <span className="detail-label">Reference:</span>
              <span className="detail-value">{currentTransaction.reference}</span>
            </div>
          )}
          
          {currentTransaction.description && (
            <div className="detail-row">
              <span className="detail-label">Description:</span>
              <span className="detail-value">{currentTransaction.description}</span>
            </div>
          )}
          
          <div className="detail-row">
            <span className="detail-label">Created:</span>
            <span className="detail-value">{formatDate(currentTransaction.created_at)}</span>
          </div>
          
          <div className="detail-row">
            <span className="detail-label">Updated:</span>
            <span className="detail-value">{formatDate(currentTransaction.updated_at)}</span>
          </div>
        </div>
      )}

      <style jsx>{`
        .payment-status {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 1.5rem;
          background: white;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        }
        
        .status-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        
        .status-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 9999px;
          font-weight: 600;
          font-size: 0.875rem;
        }
        
        .amount {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
        }
        
        .status-details {
          border-top: 1px solid #e5e7eb;
          padding-top: 1rem;
        }
        
        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }
        
        .detail-label {
          font-weight: 500;
          color: #6b7280;
        }
        
        .detail-value {
          color: #1f2937;
          font-family: monospace;
        }
        
        .refresh-indicator {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
