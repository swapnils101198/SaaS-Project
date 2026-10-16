import { useState } from 'react';
import type { ApiResource } from '../types/resource';

interface ResourceCardProps {
  resource: ApiResource;
  onEdit: (resource: ApiResource) => void;
  onDelete: (resource: ApiResource) => void;
  onPing: (id: string) => Promise<void>;
}

export function ResourceCard({ resource, onEdit, onDelete, onPing }: ResourceCardProps) {
  const [isPinging, setIsPinging] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const handlePing = async () => {
    setIsPinging(true);
    try {
      await onPing(resource.id);
    } finally {
      setIsPinging(false);
    }
  };

  const handleCopyEndpoint = async () => {
    try {
      await navigator.clipboard.writeText(resource.endpoint);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Fallback
    }
  };

  const getMethodBadgeClass = (method: string) => {
    switch (method) {
      case 'GET':
        return 'badge-method-get';
      case 'POST':
        return 'badge-method-post';
      case 'PUT':
        return 'badge-method-put';
      case 'DELETE':
        return 'badge-method-delete';
      case 'PATCH':
        return 'badge-method-patch';
      default:
        return 'badge-method-get';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'badge-status-healthy';
      case 'degraded':
        return 'badge-status-degraded';
      case 'offline':
        return 'badge-status-offline';
      default:
        return 'badge-status-healthy';
    }
  };

  const getLatencyClass = (ms: number) => {
    if (ms < 100) return 'text-latency-good';
    if (ms < 400) return 'text-latency-warning';
    return 'text-latency-danger';
  };

  return (
    <article className="resource-card" aria-labelledby={`resource-${resource.id}-title`}>
      <div className="resource-card-header">
        <div className="resource-title-group">
          <span className={`method-badge ${getMethodBadgeClass(resource.method)}`} aria-label={`HTTP ${resource.method}`}>
            {resource.method}
          </span>
          <h3 id={`resource-${resource.id}-title`} className="resource-name">
            {resource.name}
          </h3>
        </div>

        <span className={`status-badge ${getStatusBadgeClass(resource.status)}`}>
          <span className="status-dot" aria-hidden="true"></span>
          {resource.status.toUpperCase()}
        </span>
      </div>

      <div className="resource-endpoint-row">
        <code className="resource-endpoint">{resource.endpoint}</code>
        <button
          type="button"
          className="button button-ghost button-xs"
          onClick={handleCopyEndpoint}
          aria-label={`Copy endpoint path for ${resource.name}`}
          title="Copy to clipboard"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      <p className="resource-description">{resource.description}</p>

      <div className="resource-meta-row">
        <div className="resource-metrics-pair">
          <span className="meta-item">
            Latency: <strong className={getLatencyClass(resource.latencyMs)}>{resource.latencyMs}ms</strong>
          </span>
          <span className="meta-separator" aria-hidden="true">&bull;</span>
          <span className="meta-item">
            Uptime: <strong>{resource.uptimePercent}%</strong>
          </span>
        </div>

        <span className={`env-tag env-tag-${resource.environment}`}>
          {resource.environment}
        </span>
      </div>

      {resource.tags.length > 0 && (
        <div className="resource-tags-row" aria-label="Tags">
          {resource.tags.map((tag) => (
            <span key={tag} className="tag-pill">
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="resource-card-footer">
        <button
          type="button"
          className="button button-secondary button-sm"
          onClick={handlePing}
          disabled={isPinging}
          aria-label={`Test latency ping for ${resource.name}`}
        >
          {isPinging ? (
            <>
              <span className="spinner spinner-xs" aria-hidden="true"></span>
              <span>Pinging...</span>
            </>
          ) : (
            'Ping Test'
          )}
        </button>

        <div className="card-actions-right">
          <button
            type="button"
            className="button button-ghost button-sm"
            onClick={() => onEdit(resource)}
            aria-label={`Edit ${resource.name}`}
          >
            Edit
          </button>
          <button
            type="button"
            className="button button-ghost-danger button-sm"
            onClick={() => onDelete(resource)}
            aria-label={`Delete ${resource.name}`}
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}
