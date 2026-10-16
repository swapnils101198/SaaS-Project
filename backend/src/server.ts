import { app } from './app.js';

const PORT = Number(process.env.PORT) || 3000;

const server = app.listen(PORT, () => {
  console.log(`Backend server listening at http://localhost:${PORT}`);
});

// Graceful shutdown handlers for clean termination on Ctrl+C (SIGINT) or SIGTERM
const handleShutdown = (signal: string) => {
  server.close(() => {
    process.exit(0);
  });

  // Force close after 1 second if keep-alive connections linger
  setTimeout(() => {
    process.exit(0);
  }, 1000).unref();
};

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));
