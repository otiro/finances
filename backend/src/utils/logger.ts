import pino from 'pino';
import path from 'path';

const isDevelopment = process.env.NODE_ENV !== 'production';

// Configure logger with file transport in production
export const logger = isDevelopment
  ? pino({
      level: process.env.LOG_LEVEL || 'info',
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      },
    })
  : pino(
      {
        level: process.env.LOG_LEVEL || 'info',
      },
      pino.transport({
        targets: [
          // Console output
          {
            level: 'info',
            target: 'pino-pretty',
            options: {
              colorize: false,
              translateTime: 'SYS:standard',
              ignore: 'pid,hostname',
            },
          },
          // File output
          {
            level: 'info',
            target: 'pino/file',
            options: {
              destination: path.join(process.cwd(), 'logs', 'app.log'),
              mkdir: true,
            },
          },
        ],
      })
    );
