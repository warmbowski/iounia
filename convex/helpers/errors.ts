import { ConvexError } from 'convex/values'

export class UnauthenticatedError extends ConvexError<{
  type: 'UNAUTHENTICATED'
  message: string
  data?: any
}> {
  constructor(message: string, data?: any) {
    super({ type: 'UNAUTHENTICATED', message, data })
  }
}

export class UnauthorizedError extends ConvexError<{
  type: 'UNAUTHORIZED'
  message: string
  data?: any
}> {
  constructor(message: string, data?: any) {
    super({ type: 'UNAUTHORIZED', message, data })
  }
}

export class NotFoundError extends ConvexError<{
  type: 'NOT_FOUND'
  message: string
  data?: any
}> {
  constructor(message: string, data?: any) {
    super({ type: 'NOT_FOUND', message, data })
  }
}

export class InvalidError extends ConvexError<{
  type: 'INVALID'
  message: string
  data?: any
}> {
  constructor(message: string, data?: any) {
    super({ type: 'INVALID', message, data })
  }
}

export class BadRequestError extends ConvexError<{
  type: 'BAD_REQUEST'
  message: string
  data?: any
}> {
  constructor(message: string, data?: any) {
    super({ type: 'BAD_REQUEST', message, data })
  }
}

const ERROR_TYPES = [
  UnauthenticatedError,
  UnauthorizedError,
  NotFoundError,
  InvalidError,
  BadRequestError,
]

export function catchTypedError<T, E extends new (message?: string) => Error>(
  promise: Promise<T>,
  errorTypes: typeof ERROR_TYPES = ERROR_TYPES,
): Promise<{ data: T } | { err: InstanceType<E> }> {
  return promise
    .then((data) => ({ data }))
    .catch((error) => {
      if (errorTypes.length === 0) {
        return { err: error }
      }

      if (errorTypes.some((type) => error instanceof type)) {
        return { err: error }
      }

      throw error
    })
}
