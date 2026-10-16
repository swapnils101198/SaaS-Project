import { useState, useEffect, useCallback, useTransition } from 'react';
import type {
  ApiResource,
  CreateResourceDto,
  UpdateResourceDto,
  Environment,
  ServiceStatus,
  SystemMetricsResponse,
  PaginatedResponse,
} from './types/resource';
import {
  fetchResources,
  createResource,
  updateResource,
  deleteResource,
  pingResource,
  fetchMetrics,
} from './services/resource.service';
import { fetchHealth } from './services/api';
import { Header } from './components/Header';
import { MetricsBar } from './components/MetricsBar';
import { ResourceFilters } from './components/ResourceFilters';
import { ResourceCard } from './components/ResourceCard';
import { ResourceModal } from './components/ResourceModal';
import { DeleteModal } from './components/DeleteModal';
import { QuickTester } from './components/QuickTester';
import { ToastContainer, type ToastNotification } from './components/Toast';

export function App() {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean>(false);

  // Telemetry metrics
  const [metrics, setMetrics] = useState<SystemMetricsResponse | null>(null);
  const [isMetricsLoading, setIsMetricsLoading] = useState<boolean>(true);

  // Resource list state
  const [data, setData] = useState<PaginatedResponse<ApiResource>>({
    items: [],
    total: 0,
    page: 1,
    limit: 6,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [listError, setListError] = useState<string | null>(null);

  // Query filters
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [status, setStatus] = useState<ServiceStatus | 'all'>('all');
  const [environment, setEnvironment] = useState<Environment | 'all'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'latencyMs' | 'uptimePercent' | 'updatedAt'>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState<number>(1);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingResource, setEditingResource] = useState<ApiResource | null>(null);

  const [deletingResource, setDeletingResource] = useState<ApiResource | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const [, startTransition] = useTransition();

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  // Online / offline detector
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Health check polling
  const checkHealth = useCallback(async () => {
    try {
      await fetchHealth();
      setIsBackendHealthy(true);
    } catch {
      setIsBackendHealthy(false);
    }
  }, []);

  // Load metrics
  const loadMetrics = useCallback(async () => {
    try {
      const res = await fetchMetrics();
      setMetrics(res);
    } catch {
      // Ignored on fail
    } finally {
      setIsMetricsLoading(false);
    }
  }, []);

  // Load resources
  const loadResources = useCallback(async () => {
    setIsLoading(true);
    setListError(null);
    try {
      const res = await fetchResources({
        search: debouncedSearch,
        status,
        environment,
        sortBy,
        sortOrder,
        page,
        limit: 6,
      });
      setData(res);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to retrieve resources';
      setListError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, status, environment, sortBy, sortOrder, page]);

  useEffect(() => {
    checkHealth();
    loadMetrics();
  }, [checkHealth, loadMetrics]);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  // Handle Save (Create / Update)
  const handleSaveResource = async (payload: CreateResourceDto | UpdateResourceDto) => {
    if (editingResource) {
      await updateResource(editingResource.id, payload);
      addToast(`Updated ${payload.name || editingResource.name}`, 'success');
    } else {
      await createResource(payload as CreateResourceDto);
      addToast(`Registered service ${payload.name}`, 'success');
    }
    loadResources();
    loadMetrics();
  };

  // Handle Delete
  const handleConfirmDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      await deleteResource(id);
      addToast('Resource deleted successfully', 'info');
      setDeletingResource(null);
      loadResources();
      loadMetrics();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete';
      addToast(msg, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle Ping
  const handlePing = async (id: string) => {
    try {
      const updated = await pingResource(id);
      addToast(`Pinged ${updated.name}: ${updated.latencyMs}ms (${updated.status})`, 'info');
      startTransition(() => {
        setData((prev) => ({
          ...prev,
          items: prev.items.map((item) => (item.id === id ? updated : item)),
        }));
      });
      loadMetrics();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Ping failed';
      addToast(msg, 'error');
    }
  };

  return (
    <div className="app-container">
      {!isOnline && (
        <aside className="offline-banner" role="status" aria-live="assertive">
          <span aria-hidden="true">📡</span>
          <span>You are currently working offline. Reconnecting to local network...</span>
        </aside>
      )}

      {/* Header */}
      <Header
        onOpenCreateModal={() => {
          setEditingResource(null);
          setIsModalOpen(true);
        }}
        isBackendHealthy={isBackendHealthy}
        activePort={3000}
      />

      {/* Real-time System Metrics */}
      <MetricsBar metrics={metrics} isLoading={isMetricsLoading} />

      {/* Quick Core Tester (Health, Message, Greeting) */}
      <QuickTester />

      {/* Filters and Controls */}
      <ResourceFilters
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={(s) => {
          setStatus(s);
          setPage(1);
        }}
        environment={environment}
        onEnvironmentChange={(e) => {
          setEnvironment(e);
          setPage(1);
        }}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        sortOrder={sortOrder}
        onToggleSortOrder={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
      />

      {/* Resource Grid / List */}
      <main className="resource-list-section" aria-label="Services list">
        {isLoading ? (
          <div className="resource-grid" aria-label="Loading services">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div key={idx} className="resource-card skeleton-card" aria-hidden="true">
                <div className="skeleton-line skeleton-title"></div>
                <div className="skeleton-line skeleton-meta"></div>
                <div className="skeleton-line skeleton-desc"></div>
              </div>
            ))}
          </div>
        ) : listError ? (
          <div className="alert alert-error" role="alert">
            <span className="alert-icon" aria-hidden="true">⚠️</span>
            <div>
              <strong>Failed to load service directory</strong>
              <p className="error-detail">{listError}</p>
              <button
                type="button"
                className="button button-secondary button-sm mt-2"
                onClick={loadResources}
              >
                Retry
              </button>
            </div>
          </div>
        ) : data.items.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon" aria-hidden="true">🔍</span>
            <h3 className="empty-title">No services match your filters</h3>
            <p className="empty-description">
              Try adjusting your search query, environment, or status filter to find services.
            </p>
            <button
              type="button"
              className="button button-secondary"
              onClick={() => {
                setSearch('');
                setStatus('all');
                setEnvironment('all');
                setPage(1);
              }}
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="resource-grid">
            {data.items.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                onEdit={(r) => {
                  setEditingResource(r);
                  setIsModalOpen(true);
                }}
                onDelete={(r) => setDeletingResource(r)}
                onPing={handlePing}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {data.totalPages > 1 && (
          <nav className="pagination-row" aria-label="Pagination Navigation">
            <span className="pagination-info">
              Showing {(data.page - 1) * data.limit + 1} &ndash;{' '}
              {Math.min(data.page * data.limit, data.total)} of {data.total} services
            </span>

            <div className="pagination-controls">
              <button
                type="button"
                className="button button-secondary button-sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={data.page <= 1}
                aria-label="Previous Page"
              >
                &larr; Previous
              </button>

              <span className="pagination-current-page" aria-current="page">
                Page {data.page} of {data.totalPages}
              </span>

              <button
                type="button"
                className="button button-secondary button-sm"
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={data.page >= data.totalPages}
                aria-label="Next Page"
              >
                Next &rarr;
              </button>
            </div>
          </nav>
        )}
      </main>

      {/* Create / Edit Modal */}
      <ResourceModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingResource(null);
        }}
        onSubmit={handleSaveResource}
        initialResource={editingResource}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={Boolean(deletingResource)}
        resource={deletingResource}
        onClose={() => setDeletingResource(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Footer */}
      <footer className="footer" role="contentinfo">
        <p>
          APIPulse &bull; Production-Ready Full-Stack Service Directory &bull; Frontend on <strong>:5300</strong> &bull; Backend on <strong>:3000</strong>
        </p>
      </footer>
    </div>
  );
}

export default App;
