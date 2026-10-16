import type { Environment, ServiceStatus } from '../types/resource';

interface ResourceFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  status: ServiceStatus | 'all';
  onStatusChange: (val: ServiceStatus | 'all') => void;
  environment: Environment | 'all';
  onEnvironmentChange: (val: Environment | 'all') => void;
  sortBy: 'name' | 'latencyMs' | 'uptimePercent' | 'updatedAt';
  onSortByChange: (val: 'name' | 'latencyMs' | 'uptimePercent' | 'updatedAt') => void;
  sortOrder: 'asc' | 'desc';
  onToggleSortOrder: () => void;
}

export function ResourceFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  environment,
  onEnvironmentChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onToggleSortOrder,
}: ResourceFiltersProps) {
  return (
    <section className="filter-panel" aria-label="Resource filters and sorting">
      <div className="search-box">
        <label htmlFor="search-input" className="sr-only">
          Search services by name, path, tag, or description
        </label>
        <span className="search-icon" aria-hidden="true">
          🔍
        </span>
        <input
          id="search-input"
          type="search"
          className="search-input"
          placeholder="Filter by name, endpoint, or tag..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {search && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={() => onSearchChange('')}
            aria-label="Clear search query"
          >
            &times;
          </button>
        )}
      </div>

      <div className="filter-controls-row">
        {/* Environment Selector */}
        <div className="filter-control-item">
          <label htmlFor="env-select" className="filter-label">
            Environment:
          </label>
          <select
            id="env-select"
            className="filter-select"
            value={environment}
            onChange={(e) => onEnvironmentChange(e.target.value as Environment | 'all')}
          >
            <option value="all">All Environments</option>
            <option value="production">Production</option>
            <option value="staging">Staging</option>
            <option value="development">Development</option>
          </select>
        </div>

        {/* Status Pill Tabs */}
        <div className="status-pills" role="radiogroup" aria-label="Filter by service health status">
          {(['all', 'healthy', 'degraded', 'offline'] as const).map((s) => (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={status === s}
              className={`status-filter-pill ${status === s ? 'status-filter-pill-active' : ''}`}
              onClick={() => onStatusChange(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* Sort Dropdown & Toggle */}
        <div className="sort-group">
          <label htmlFor="sort-select" className="filter-label">
            Sort:
          </label>
          <select
            id="sort-select"
            className="filter-select"
            value={sortBy}
            onChange={(e) =>
              onSortByChange(
                e.target.value as 'name' | 'latencyMs' | 'uptimePercent' | 'updatedAt'
              )
            }
          >
            <option value="updatedAt">Recently Updated</option>
            <option value="name">Service Name</option>
            <option value="latencyMs">Latency</option>
            <option value="uptimePercent">Uptime %</option>
          </select>

          <button
            type="button"
            className="button button-secondary button-icon"
            onClick={onToggleSortOrder}
            aria-label={`Toggle sort order, currently ${sortOrder === 'asc' ? 'ascending' : 'descending'}`}
            title={`Sort ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>
    </section>
  );
}
