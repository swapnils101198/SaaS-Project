import type { SystemMetricsResponse } from '../types/resource';

interface MetricsBarProps {
  metrics: SystemMetricsResponse | null;
  isLoading: boolean;
}

export function MetricsBar({ metrics, isLoading }: MetricsBarProps) {
  if (isLoading && !metrics) {
    return (
      <section className="metrics-grid" aria-label="System telemetry metrics">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="metric-card skeleton-card" aria-hidden="true">
            <div className="skeleton-line skeleton-title"></div>
            <div className="skeleton-line skeleton-value"></div>
          </div>
        ))}
      </section>
    );
  }

  const formatUptime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 60) {
      const hours = Math.floor(mins / 60);
      return `${hours}h ${mins % 60}m`;
    }
    return `${mins}m ${secs}s`;
  };

  return (
    <section className="metrics-grid" aria-label="System telemetry metrics">
      <div className="metric-card">
        <span className="metric-label">Managed Services</span>
        <div className="metric-value-row">
          <span className="metric-value">{metrics?.totalResources ?? 0}</span>
          <span className="metric-subtext">Active Endpoints</span>
        </div>
      </div>

      <div className="metric-card">
        <span className="metric-label">Fleet Health Ratio</span>
        <div className="metric-value-row">
          <span className="metric-value text-success">
            {metrics?.overallHealthPercent ?? 100}%
          </span>
          <span className="metric-subtext">
            {metrics?.healthyResources ?? 0} healthy &bull; {metrics?.degradedResources ?? 0} degraded
          </span>
        </div>
      </div>

      <div className="metric-card">
        <span className="metric-label">Average Latency</span>
        <div className="metric-value-row">
          <span className="metric-value">{metrics?.avgLatencyMs ?? 0}ms</span>
          <span className="metric-subtext">Round-trip mean</span>
        </div>
      </div>

      <div className="metric-card">
        <span className="metric-label">Backend Telemetry</span>
        <div className="metric-value-row">
          <span className="metric-value">{formatUptime(metrics?.uptimeSeconds ?? 0)}</span>
          <span className="metric-subtext">{metrics?.memoryUsageMb ?? 0} MB heap used</span>
        </div>
      </div>
    </section>
  );
}
