import winston from "winston"

const level = process.env.LOG_LEVEL ?? (process.env.NODE_ENV === "production" ? "info" : "debug")
const isProd = process.env.NODE_ENV === "production"

export const logger = winston.createLogger({
  level,
  format: isProd ? winston.format.json() : winston.format.combine(winston.format.colorize(), winston.format.simple()),
  transports: [new winston.transports.Console()],
})