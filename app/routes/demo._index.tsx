// Demo Index Page

import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "Payment Integration Demos - Paypack Template" },
    { name: "description", content: "Explore different payment integration scenarios including e-commerce, betting, and shopping applications." },
  ];
};

export default function DemoIndex() {
  return (
    <div className="demo-index">
      <div className="container">
        <header className="header">
          <h1>Payment Integration Demos</h1>
          <p>
            Explore different scenarios where Paypack payment integration can be used 
            to build powerful African payment solutions.
          </p>
          <Link to="/" className="back-link">← Back to Home</Link>
        </header>

        <div className="demos-grid">
          <div className="demo-card ecommerce">
            <div className="demo-icon">🛒</div>
            <h2>E-commerce Checkout</h2>
            <p>
              Complete e-commerce checkout flow with cart management, 
              product selection, and secure payment processing.
            </p>
            <div className="demo-features">
              <span className="feature-tag">Shopping Cart</span>
              <span className="feature-tag">Product Catalog</span>
              <span className="feature-tag">Order Management</span>
            </div>
            <Link to="/demo/ecommerce" className="demo-button">
              Try E-commerce Demo
            </Link>
          </div>

          <div className="demo-card betting">
            <div className="demo-icon">🎲</div>
            <h2>Betting Platform</h2>
            <p>
              Sports betting and gaming platform with account deposits, 
              withdrawals, and balance management.
            </p>
            <div className="demo-features">
              <span className="feature-tag">Account Balance</span>
              <span className="feature-tag">Deposits</span>
              <span className="feature-tag">Withdrawals</span>
            </div>
            <Link to="/demo/betting" className="demo-button">
              Try Betting Demo
            </Link>
          </div>

          <div className="demo-card shopping">
            <div className="demo-icon">🛍️</div>
            <h2>Shopping App</h2>
            <p>
              Mobile-first shopping experience with quick payments, 
              wishlist management, and order tracking.
            </p>
            <div className="demo-features">
              <span className="feature-tag">Quick Pay</span>
              <span className="feature-tag">Wishlist</span>
              <span className="feature-tag">Order Tracking</span>
            </div>
            <Link to="/demo/shopping" className="demo-button">
              Try Shopping Demo
            </Link>
          </div>

          <div className="demo-card general">
            <div className="demo-icon">💳</div>
            <h2>General Payment</h2>
            <p>
              Basic payment form for any use case - perfect starting point 
              for custom payment integrations.
            </p>
            <div className="demo-features">
              <span className="feature-tag">Simple Form</span>
              <span className="feature-tag">Status Tracking</span>
              <span className="feature-tag">Customizable</span>
            </div>
            <Link to="/payment/create" className="demo-button">
              Try General Payment
            </Link>
          </div>
        </div>

        <section className="integration-info">
          <h2>Integration Features</h2>
          <div className="info-grid">
            <div className="info-item">
              <h3>🔐 Secure Authentication</h3>
              <p>JWT-based authentication with automatic token refresh</p>
            </div>
            <div className="info-item">
              <h3>📱 Mobile Money</h3>
              <p>Support for MTN Mobile Money, Airtel Money, and more</p>
            </div>
            <div className="info-item">
              <h3>💰 Multi-Currency</h3>
              <p>RWF, USD, EUR with proper formatting and validation</p>
            </div>
            <div className="info-item">
              <h3>🔔 Real-time Updates</h3>
              <p>Webhook integration for instant payment notifications</p>
            </div>
            <div className="info-item">
              <h3>📊 Transaction Management</h3>
              <p>Complete transaction history and status monitoring</p>
            </div>
            <div className="info-item">
              <h3>🛡️ Error Handling</h3>
              <p>Comprehensive error handling and user feedback</p>
            </div>
          </div>
        </section>

        <section className="getting-started">
          <h2>Getting Started</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Set Up Environment</h3>
                <p>Configure your Paypack credentials in <code>.env</code></p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Choose a Demo</h3>
                <p>Select the demo that matches your use case</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Customize & Deploy</h3>
                <p>Modify the code to fit your specific requirements</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <style jsx>{`
        .demo-index {
          min-height: 100vh;
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          padding: 2rem 0;
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }
        
        .header {
          text-align: center;
          color: white;
          margin-bottom: 4rem;
        }
        
        .header h1 {
          font-size: 3rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }
        
        .header p {
          font-size: 1.25rem;
          margin-bottom: 2rem;
          opacity: 0.9;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }
        
        .back-link {
          color: white;
          text-decoration: none;
          font-weight: 500;
          border-bottom: 2px solid rgba(255, 255, 255, 0.3);
        }
        
        .demos-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-bottom: 4rem;
        }
        
        .demo-card {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          text-align: center;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease;
        }
        
        .demo-card:hover {
          transform: translateY(-5px);
        }
        
        .demo-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }
        
        .demo-card h2 {
          font-size: 1.5rem;
          margin-bottom: 1rem;
          color: #1f2937;
        }
        
        .demo-card p {
          color: #6b7280;
          margin-bottom: 1.5rem;
          line-height: 1.6;
        }
        
        .demo-features {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          justify-content: center;
          margin-bottom: 2rem;
        }
        
        .feature-tag {
          background: #e5e7eb;
          color: #374151;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
        }
        
        .demo-button {
          display: inline-block;
          background: #3b82f6;
          color: white;
          padding: 1rem 2rem;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          transition: background-color 0.2s;
        }
        
        .demo-button:hover {
          background: #2563eb;
        }
        
        .integration-info, .getting-started {
          background: white;
          border-radius: 16px;
          padding: 3rem;
          margin-bottom: 2rem;
        }
        
        .integration-info h2, .getting-started h2 {
          text-align: center;
          font-size: 2rem;
          margin-bottom: 2rem;
          color: #1f2937;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
        }
        
        .info-item h3 {
          margin-bottom: 0.5rem;
          color: #1f2937;
        }
        
        .info-item p {
          color: #6b7280;
        }
        
        .steps {
          display: flex;
          justify-content: space-around;
          flex-wrap: wrap;
          gap: 2rem;
        }
        
        .step {
          display: flex;
          align-items: center;
          gap: 1rem;
          max-width: 300px;
        }
        
        .step-number {
          width: 3rem;
          height: 3rem;
          border-radius: 50%;
          background: #f093fb;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.25rem;
        }
        
        .step-content h3 {
          margin-bottom: 0.5rem;
          color: #1f2937;
        }
        
        .step-content code {
          background: #e5e7eb;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-family: monospace;
        }
      `}</style>
    </div>
  );
}
