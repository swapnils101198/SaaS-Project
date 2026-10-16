import { useState, type FormEvent, type ChangeEvent } from 'react';
import { sendGreeting } from '../services/api';

const MAX_NAME_LENGTH = 100;

export function GreetingForm() {
  const [name, setName] = useState<string>('');
  const [greeting, setGreeting] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmed = name.trim();
    if (!trimmed) {
      setErrorMessage('Please enter a name before submitting.');
      setGreeting(null);
      return;
    }

    if (trimmed.length > MAX_NAME_LENGTH) {
      setErrorMessage(`Name cannot exceed ${MAX_NAME_LENGTH} characters.`);
      setGreeting(null);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await sendGreeting(trimmed);
      setGreeting(response.greeting);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setErrorMessage(message);
      setGreeting(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  const handleReset = () => {
    setName('');
    setGreeting(null);
    setErrorMessage(null);
  };

  return (
    <section className="card" aria-labelledby="greeting-card-title">
      <h2 id="greeting-card-title" className="card-title">Interactive API Greeting</h2>
      <p className="card-description">
        Demonstrates a <code>POST /api/greeting</code> call with TypeScript type contracts, input length validation, and error feedback.
      </p>

      <form onSubmit={handleSubmit} className="form" noValidate>
        <div className="form-group">
          <div className="form-label-row">
            <label htmlFor="name-input" className="form-label">
              Your Name <span className="label-required" aria-hidden="true">*</span>
            </label>
            <span className={`char-counter ${name.length > MAX_NAME_LENGTH ? 'char-counter-exceeded' : ''}`}>
              {name.length}/{MAX_NAME_LENGTH}
            </span>
          </div>

          <input
            id="name-input"
            type="text"
            className={`form-input ${errorMessage ? 'form-input-error' : ''}`}
            placeholder="e.g. Ada Lovelace"
            value={name}
            onChange={handleInputChange}
            disabled={isLoading}
            autoComplete="name"
            maxLength={MAX_NAME_LENGTH + 10}
            aria-required="true"
            aria-invalid={Boolean(errorMessage)}
            aria-describedby={errorMessage ? 'greeting-error-msg' : undefined}
          />
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="button button-primary"
            disabled={isLoading || name.trim().length === 0}
          >
            {isLoading ? (
              <>
                <span className="spinner" aria-hidden="true"></span>
                <span>Sending...</span>
              </>
            ) : (
              'Submit Greeting'
            )}
          </button>

          {(name || greeting || errorMessage) && (
            <button
              type="button"
              onClick={handleReset}
              disabled={isLoading}
              className="button button-secondary"
            >
              Reset
            </button>
          )}
        </div>
      </form>

      {errorMessage && (
        <div id="greeting-error-msg" className="alert alert-error" role="alert" aria-live="assertive">
          <span className="alert-icon" aria-hidden="true">⚠️</span>
          <span>{errorMessage}</span>
        </div>
      )}

      {greeting && (
        <div className="alert alert-success" role="status" aria-live="polite">
          <span className="alert-icon" aria-hidden="true">🎉</span>
          <div>
            <strong>Server Response:</strong>
            <p className="greeting-text">{greeting}</p>
          </div>
        </div>
      )}
    </section>
  );
}
