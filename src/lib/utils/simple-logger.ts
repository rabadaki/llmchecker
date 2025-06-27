/**
 * Simple logger fallback for production environments
 */

interface Logger {
  info: (message: string, ...args: any[]) => void;
  warn: (message: string, ...args: any[]) => void;
  error: (message: string, ...args: any[]) => void;
  debug: (message: string, ...args: any[]) => void;
}

const createSimpleLogger = (): Logger => {
  const isProduction = process.env.NODE_ENV === 'production';
  const timestamp = () => new Date().toISOString();

  return {
    info: (message: string, ...args: any[]) => {
      console.log(`[${timestamp()}] INFO: ${message}`, ...args);
    },
    warn: (message: string, ...args: any[]) => {
      console.warn(`[${timestamp()}] WARN: ${message}`, ...args);
    },
    error: (message: string, ...args: any[]) => {
      console.error(`[${timestamp()}] ERROR: ${message}`, ...args);
    },
    debug: (message: string, ...args: any[]) => {
      if (!isProduction) {
        console.debug(`[${timestamp()}] DEBUG: ${message}`, ...args);
      }
    },
  };
};

export const simpleLogger = createSimpleLogger();