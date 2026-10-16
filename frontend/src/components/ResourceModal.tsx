import { useState, useEffect, useRef, type FormEvent } from 'react';
import type {
  ApiResource,
  CreateResourceDto,
  UpdateResourceDto,
  HttpMethod,
  Environment,
  ServiceStatus,
} from '../types/resource';

interface ResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateResourceDto | UpdateResourceDto) => Promise<void>;
  initialResource?: ApiResource | null;
}

export function ResourceModal({
  isOpen,
  onClose,
  onSubmit,
  initialResource,
}: ResourceModalProps) {
  const [name, setName] = useState<string>('');
  const [endpoint, setEndpoint] = useState<string>('');
  const [method, setMethod] = useState<HttpMethod>('GET');
  const [environment, setEnvironment] = useState<Environment>('production');
  const [status, setStatus] = useState<ServiceStatus>('healthy');
  const [description, setDescription] = useState<string>('');
  const [tagsInput, setTagsInput] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const firstInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const isEdit = Boolean(initialResource);

  useEffect(() => {
    if (initialResource) {
      setName(initialResource.name);
      setEndpoint(initialResource.endpoint);
      setMethod(initialResource.method);
      setEnvironment(initialResource.environment);
      setStatus(initialResource.status);
      setDescription(initialResource.description);
      setTagsInput(initialResource.tags.join(', '));
    } else {
      setName('');
      setEndpoint('');
      setMethod('GET');
      setEnvironment('production');
      setStatus('healthy');
      setDescription('');
      setTagsInput('');
    }
    setErrors({});
  }, [initialResource, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => firstInputRef.current?.focus(), 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!name.trim() || name.trim().length < 2 || name.trim().length > 60) {
      errs.name = 'Name must be between 2 and 60 characters.';
    }

    const trimmedEndpoint = endpoint.trim();
    if (
      !trimmedEndpoint ||
      trimmedEndpoint.length > 120 ||
      (!trimmedEndpoint.startsWith('/') && !/^https?:\/\//i.test(trimmedEndpoint))
    ) {
      errs.endpoint = 'Endpoint must be a valid path (e.g. /api/v1/auth) or absolute URL.';
    }

    if (description.length > 250) {
      errs.description = 'Description cannot exceed 250 characters.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const parsedTags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        name: name.trim(),
        endpoint: endpoint.trim(),
        method,
        environment,
        status,
        description: description.trim(),
        tags: parsedTags,
      };

      await onSubmit(payload);
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save resource';
      setErrors((prev) => ({ ...prev, form: msg }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal-content"
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-header">
          <h2 id="modal-title" className="modal-title">
            {isEdit ? 'Edit API Resource' : 'Register New API Resource'}
          </h2>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form" noValidate>
          {errors.form && (
            <div className="alert alert-error" role="alert">
              <span className="alert-icon" aria-hidden="true">⚠️</span>
              <span>{errors.form}</span>
            </div>
          )}

          {/* Name */}
          <div className="form-group">
            <div className="form-label-row">
              <label htmlFor="resource-name" className="form-label">
                Service Name <span className="label-required">*</span>
              </label>
              <span className="char-counter">{name.length}/60</span>
            </div>
            <input
              id="resource-name"
              ref={firstInputRef}
              type="text"
              className={`form-input ${errors.name ? 'form-input-error' : ''}`}
              placeholder="e.g. User Identity & Auth Service"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={70}
              aria-required="true"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
            {errors.name && <span id="name-error" className="form-field-error">{errors.name}</span>}
          </div>

          {/* Method and Endpoint */}
          <div className="form-row-grid">
            <div className="form-group">
              <label htmlFor="resource-method" className="form-label">
                Method <span className="label-required">*</span>
              </label>
              <select
                id="resource-method"
                className="form-input"
                value={method}
                onChange={(e) => setMethod(e.target.value as HttpMethod)}
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
                <option value="PATCH">PATCH</option>
              </select>
            </div>

            <div className="form-group flex-2">
              <label htmlFor="resource-endpoint" className="form-label">
                Endpoint URL or Path <span className="label-required">*</span>
              </label>
              <input
                id="resource-endpoint"
                type="text"
                className={`form-input ${errors.endpoint ? 'form-input-error' : ''}`}
                placeholder="/api/v1/resource or https://..."
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                maxLength={130}
                aria-required="true"
                aria-invalid={Boolean(errors.endpoint)}
                aria-describedby={errors.endpoint ? 'endpoint-error' : undefined}
              />
              {errors.endpoint && (
                <span id="endpoint-error" className="form-field-error">
                  {errors.endpoint}
                </span>
              )}
            </div>
          </div>

          {/* Environment and Status */}
          <div className="form-row-grid">
            <div className="form-group">
              <label htmlFor="resource-env" className="form-label">
                Environment <span className="label-required">*</span>
              </label>
              <select
                id="resource-env"
                className="form-input"
                value={environment}
                onChange={(e) => setEnvironment(e.target.value as Environment)}
              >
                <option value="production">Production</option>
                <option value="staging">Staging</option>
                <option value="development">Development</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="resource-status" className="form-label">
                Health Status <span className="label-required">*</span>
              </label>
              <select
                id="resource-status"
                className="form-input"
                value={status}
                onChange={(e) => setStatus(e.target.value as ServiceStatus)}
              >
                <option value="healthy">Healthy</option>
                <option value="degraded">Degraded</option>
                <option value="offline">Offline</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <div className="form-label-row">
              <label htmlFor="resource-desc" className="form-label">
                Description
              </label>
              <span className="char-counter">{description.length}/250</span>
            </div>
            <textarea
              id="resource-desc"
              rows={3}
              className={`form-input ${errors.description ? 'form-input-error' : ''}`}
              placeholder="Brief summary of service responsibilities..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={260}
            />
            {errors.description && (
              <span className="form-field-error">{errors.description}</span>
            )}
          </div>

          {/* Tags */}
          <div className="form-group">
            <label htmlFor="resource-tags" className="form-label">
              Tags (comma separated)
            </label>
            <input
              id="resource-tags"
              type="text"
              className="form-input"
              placeholder="auth, core, microservice"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="modal-actions">
            <button
              type="button"
              className="button button-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="button button-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Register Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
