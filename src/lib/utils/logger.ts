/**
 * Logging utility using Winston - Production optimized
 */

import winston from 'winston';

const logLevel = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

const transports: winston.transport[] = [];

// Always add console transport (works in all environments)
transports.push(new winston.transports.Console({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    process.env.NODE_ENV === 'production' 
      ? winston.format.json()
      : winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
  )
}));

// Only add file transports in development (not available in serverless)
if (process.env.NODE_ENV !== 'production') {
  try {
    transports.push(
      new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
      new winston.transports.File({ filename: 'logs/combined.log' })
    );
  } catch (error) {
    // Ignore file transport errors in production
    console.warn('File logging not available in this environment');
  }
}

export const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'llm-checker' },
  transports,
});