import { ConvexError } from 'convex/values'

type Severity = 'danger' | 'warning' | 'info' | 'none'

export class UnauthenticatedError extends ConvexError<{
  type: 'UNAUTHENTICATED'
  severity: Severity
  message: string
  data?: any
}> {
  constructor(message: string, data?: any) {
    super({ type: 'UNAUTHENTICATED', severity: 'danger', message, data })
  }
}

export class UnauthorizedError extends ConvexError<{
  type: 'UNAUTHORIZED'
  severity: Severity
  message: string
  data?: any
}> {
  constructor(message: string, data?: any) {
    super({ type: 'UNAUTHORIZED', severity: 'danger', message, data })
  }
}

export class NotFoundError extends ConvexError<{
  type: 'NOT_FOUND'
  severity: Severity
  message: string
  data?: any
}> {
  constructor(message: string, data?: any) {
    super({ type: 'NOT_FOUND', severity: 'none', message, data })
  }
}

export class InvalidError extends ConvexError<{
  type: 'INVALID'
  severity: Severity
  message: string
  data?: any
}> {
  constructor(message: string, data?: any) {
    super({ type: 'INVALID', severity: 'warning', message, data })
  }
}

export class BadRequestError extends ConvexError<{
  type: 'BAD_REQUEST'
  severity: Severity
  message: string
  data?: any
}> {
  constructor(message: string, data?: any) {
    super({ type: 'BAD_REQUEST', severity: 'danger', message, data })
  }
}

const ERROR_TYPES = [
  UnauthenticatedError,
  UnauthorizedError,
  NotFoundError,
  InvalidError,
  BadRequestError,
]
