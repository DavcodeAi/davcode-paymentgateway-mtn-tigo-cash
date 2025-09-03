// Transactions List Route

import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData, useSearchParams } from '@remix-run/react';
import TransactionList from '~/components/TransactionList';
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
      filters: {
        status,
      },
      success: true,
    });
  } catch (error) {
    console.error('Failed to fetch transactions:', error);
    
    if (error instanceof PaypackAPIError) {
      return json({ 
        error: `Failed to fetch transactions: ${error.message}`,
        statusCode: error.statusCode 
      }, { status: error.statusCode });
    }

    return json({ 
      error: 'An unexpected error occurred while fetching transactions' 
    }, { status: 500 });
  }
}

export default function Transactions() {
  const data = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

  if ('error' in data) {
    return (
      <div className="container">
        <div className="error-container">
          <h1>Error Loading Transactions</h1>
          <p>{data.error}</p>
        </div>
      </div>
    );
  }

  const { transactions, pagination, filters } = data;

  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
  };

  const handleStatusFilter = (status: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (status === 'all') {
      newParams.delete('status');
    } else {
      newParams.set('status', status);
    }
    newParams.delete('page'); // Reset to first page
    setSearchParams(newParams);
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Payment Transactions</h1>
        <p>View and manage all payment transactions</p>
      </div>

      <div className="filters">
        <div className="filter-group">
          <label>Filter by Status:</label>
          <select 
            value={filters.status || 'all'} 
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="status-filter"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <TransactionList
        transactions={transactions}
        showPagination={true}
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={handlePageChange}
      />

      <div className="summary">
        <p>
          Showing {transactions.length} of {pagination.totalItems} transactions
          {filters.status && ` (filtered by: ${filters.status})`}
        </p>
      </div>

      <style jsx>{`
        .container {
          max-width: 1200px;
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
        
        .filters {
          margin-bottom: 2rem;
          padding: 1rem;
          background: #f9fafb;
          border-radius: 8px;
        }
        
        .filter-group {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .filter-group label {
          font-weight: 500;
          color: #374151;
        }
        
        .status-filter {
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          background: white;
        }
        
        .summary {
          margin-top: 2rem;
          text-align: center;
          color: #6b7280;
          font-size: 0.875rem;
        }
        
        .error-container {
          text-align: center;
          padding: 3rem;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          color: #dc2626;
        }
      `}</style>
    </div>
  );
}
