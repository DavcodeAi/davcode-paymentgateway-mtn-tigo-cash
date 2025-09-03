import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "Paypack Integration Template - African Payment Solutions" },
    { name: "description", content: "Simple Remix template with Paypack integration for cashin, cashout, and transaction management." },
  ];
};

export default function Index() {
  return (
    <div className="homepage">
      <header className="hero">
        <div className="hero-content">
          <h1>Paypack Integration Template</h1>
          <p>
            Simple Remix template with Paypack integration for African payment solutions.
            Handle cashin, cashout, and transaction management with ease.
          </p>
          <div className="hero-actions">
            <Link to="/cashin" className="cta-button primary">
              Cash In
            </Link>
            <Link to="/cashout" className="cta-button secondary">
              Cash Out
            </Link>
            <Link to="/transactions" className="cta-button secondary">
              View Transactions
            </Link>
          </div>
        </div>
      </header>

      <section className="features">
        <div className="container">
          <h2>Core Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>Cash In</h3>
              <p>Deposit money to accounts using mobile money, bank transfers, or cards.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💸</div>
              <h3>Cash Out</h3>
              <p>Withdraw money from accounts to mobile money or bank accounts.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Transaction History</h3>
              <p>View and manage all transactions with real-time status updates.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Secure & Reliable</h3>
              <p>JWT authentication with automatic token refresh and error handling.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="use-cases">
        <div className="container">
          <h2>Perfect For</h2>
          <div className="use-cases-grid">
            <div className="use-case">
              <h3>🛒 E-commerce</h3>
              <p>Handle customer payments and refunds for online stores.</p>
            </div>
            <div className="use-case">
              <h3>🎲 Betting & Gaming</h3>
              <p>Manage deposits and withdrawals for gaming platforms.</p>
            </div>
            <div className="use-case">
              <h3>💼 Business Apps</h3>
              <p>Process payments for any business application or service.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="quick-start">
        <div className="container">
          <h2>Quick Start</h2>
          <div className="quick-start-steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Configure Environment</h3>
                <p>Set up your Paypack credentials in <code>.env</code></p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Start Using</h3>
                <p>Use cashin/cashout forms for transactions</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Monitor</h3>
                <p>Track all transactions in real-time</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="footer-links">
            <Link to="/cashin">Cash In</Link>
            <Link to="/cashout">Cash Out</Link>
            <Link to="/transactions">Transactions</Link>
          </div>
          <p>Built with Remix and Paypack for African payment solutions</p>
        </div>
      </footer>

      <style>{`
        .homepage {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .hero {
          padding: 4rem 2rem;
          text-align: center;
          color: white;
        }

        .hero-content h1 {
          font-size: 3rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }

        .hero-content p {
          font-size: 1.25rem;
          margin-bottom: 2rem;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
          opacity: 0.9;
        }

        .hero-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .cta-button {
          padding: 1rem 2rem;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          transition: transform 0.2s;
        }

        .cta-button:hover {
          transform: translateY(-2px);
        }

        .cta-button.primary {
          background: #10b981;
          color: white;
        }

        .cta-button.secondary {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.3);
        }

        .features, .use-cases, .quick-start {
          padding: 4rem 2rem;
          background: white;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .features h2, .use-cases h2, .quick-start h2 {
          text-align: center;
          font-size: 2.5rem;
          margin-bottom: 3rem;
          color: #1f2937;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .feature-card {
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          text-align: center;
          background: #f9fafb;
        }

        .feature-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .feature-card h3 {
          font-size: 1.5rem;
          margin-bottom: 1rem;
          color: #1f2937;
        }

        .use-cases-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 2rem;
        }

        .use-case {
          padding: 2rem;
          border-radius: 12px;
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
          text-align: center;
        }

        .use-case h3 {
          font-size: 1.5rem;
          margin-bottom: 1rem;
        }

        .demo-link {
          display: inline-block;
          margin-top: 1rem;
          color: white;
          text-decoration: none;
          font-weight: 600;
          border-bottom: 2px solid rgba(255, 255, 255, 0.5);
        }

        .quick-start-steps {
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
          background: #3b82f6;
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

        .footer {
          background: #1f2937;
          color: white;
          padding: 2rem;
          text-align: center;
        }

        .footer-links {
          display: flex;
          justify-content: center;
          gap: 2rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }

        .footer-links a {
          color: #9ca3af;
          text-decoration: none;
        }

        .footer-links a:hover {
          color: white;
        }
      `}</style>
    </div>
  );
}
