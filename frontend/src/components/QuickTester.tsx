import { useState } from 'react';
import { fetchHealth, fetchMessage } from '../services/api';
import type { HealthResponse } from '../types/api';
import { GreetingForm } from './GreetingForm';

export function QuickTester() {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [healthData, setHealthData] = useState<HealthResponse | null>(null);
  const [isHealthLoading, setIsHealthLoading] = useState<boolean>(false);
  const [healthLatency, setHealthLatency] = useState<number | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);

  const [messageData, setMessageData] = useState<string | null>(null);
  const [isMessageLoading, setIsMessageLoading] = useState<boolean>(false);
  const [messageLatency, setMessageLatency] = useState<number | null>(null);
  const [messageError, setMessageError] = useState<string | null>(null);

  const testHealth = async () => {
    setIsHealthLoading(true);
    setHealthError(null);
    const start = performance.now();
    try {
      const res = await fetchHealth();
      setHealthData(res);
      setHealthLatency(Math.round(performance.now() - start));
    } catch (err) {
      setHealthError(err instanceof Error ? err.message : 'Health check failed');
      setHealthData(null);
    } finally {
      setIsHealthLoading(false);
    }
  };

  const testMessage = async () => {
    setIsMessageLoading(true);
    setMessageError(null);
    const start = performance.now();
    try {
      const res = await fetchMessage();
      setMessageData(res.message);
      setMessageLatency(Math.round(performance.now() - start));
    } catch (err) {
      setMessageError(err instanceof Error ? err.message : 'Message fetch failed');
      setMessageData(null);
    } finally {
      setIsMessageLoading(false);
    }
  };

  return (
    <section className="card tester-card" aria-labelledby="tester-title">
      <div className="tester-header" onClick={() => setIsOpen(!isOpen)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsOpen(!isOpen); }}>
        <div>
          <h2 id="tester-title" className="card-title">Interactive API Core Sandbox</h2>
          <p className="card-description">
            Test the live core endpoints (<code>GET /api/health</code>, <code>GET /api/message</code>, and <code>POST /api/greeting</code>) with telemetry timings.
          </p>
        </div>
        <button
          type="button"
          className="button button-ghost button-sm"
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Collapse API Sandbox' : 'Expand API Sandbox'}
        >
          {isOpen ? '▲ Collapse' : '▼ Expand'}
        </button>
      </div>

      {isOpen && (
        <div className="tester-body">
          <div className="tester-split-row">
            {/* Health Test */}
            <div className="tester-subcard">
              <div className="tester-subcard-header">
                <span className="method-badge badge-method-get">GET</span>
                <code>/api/health</code>
                <button
                  type="button"
                  className="button button-secondary button-xs ml-auto"
                  onClick={testHealth}
                  disabled={isHealthLoading}
                >
                  {isHealthLoading ? 'Pinging...' : 'Execute'}
                </button>
              </div>

              {healthData && (
                <div className="tester-result">
                  <div className="tester-result-meta">
                    <span className="text-success font-semibold">200 OK</span>
                    {healthLatency !== null && <span className="badge badge-latency">{healthLatency}ms</span>}
                  </div>
                  <pre className="tester-json">{JSON.stringify(healthData, null, 2)}</pre>
                </div>
              )}

              {healthError && (
                <div className="alert alert-error" role="alert">
                  <span>{healthError}</span>
                </div>
              )}
            </div>

            {/* Message Test */}
            <div className="tester-subcard">
              <div className="tester-subcard-header">
                <span className="method-badge badge-method-get">GET</span>
                <code>/api/message</code>
                <button
                  type="button"
                  className="button button-secondary button-xs ml-auto"
                  onClick={testMessage}
                  disabled={isMessageLoading}
                >
                  {isMessageLoading ? 'Fetching...' : 'Execute'}
                </button>
              </div>

              {messageData && (
                <div className="tester-result">
                  <div className="tester-result-meta">
                    <span className="text-success font-semibold">200 OK</span>
                    {messageLatency !== null && <span className="badge badge-latency">{messageLatency}ms</span>}
                  </div>
                  <pre className="tester-json">{JSON.stringify({ message: messageData }, null, 2)}</pre>
                </div>
              )}

              {messageError && (
                <div className="alert alert-error" role="alert">
                  <span>{messageError}</span>
                </div>
              )}
            </div>
          </div>

          {/* Greeting Form */}
          <div className="tester-greeting-wrapper">
            <GreetingForm />
          </div>
        </div>
      )}
    </section>
  );
}
