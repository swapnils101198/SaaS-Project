interface HeaderProps {
  onOpenCreateModal: () => void;
  isBackendHealthy: boolean;
  activePort: number;
}

export function Header({ onOpenCreateModal, isBackendHealthy, activePort }: HeaderProps) {
  return (
    <header className="header" role="banner">
      <div className="header-top-row">
        <div className="brand-group">
          <div className="brand-icon" aria-hidden="true">
            <span className="pulse-dot"></span>
          </div>
          <div>
            <div className="brand-title-row">
              <h1 className="brand-title">APIPulse</h1>
              <span className="badge badge-version">v1.2.0</span>
            </div>
            <p className="brand-subtitle">Developer Service & API Resource Manager</p>
          </div>
        </div>

        <div className="header-controls">
          <div className="status-pill" title={`Backend running on port ${activePort}`}>
            <span
              className={`status-indicator ${isBackendHealthy ? 'status-indicator-online' : 'status-indicator-offline'}`}
              aria-hidden="true"
            ></span>
            <span className="status-pill-text">
              API Core: <strong>{isBackendHealthy ? 'ONLINE' : 'CONNECTING'}</strong>
            </span>
          </div>

          <button
            type="button"
            className="button button-primary"
            onClick={onOpenCreateModal}
            aria-label="Register a new API service"
          >
            <span aria-hidden="true">+</span> Register Service
          </button>
        </div>
      </div>
    </header>
  );
}
