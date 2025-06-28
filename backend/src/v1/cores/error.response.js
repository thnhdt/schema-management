import { StatusCode } from "../utils/statusCode.js"
import { ReasonPhrase } from "../utils/reasonPhrase.js"

const ReasonStatusCode = {
  FORBIDDEN: 'Bad request error',
  CONFLICT: 'Conflict error'
}

class ErrorResponse extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

export class BadResponseError extends ErrorResponse {
  constructor(message = ReasonStatusCode.FORBIDDEN, status = StatusCode.FORBIDDEN) {
    super(message, status)
  }
}
export class ConflictResponseError extends ErrorResponse {
  constructor(message = ReasonStatusCode.CONFLICT, status = StatusCode.CONFLICT) {
    super(message, status)
  }
}

export class AuthFailureError extends ErrorResponse {
  constructor(message = ReasonPhrase.UNAUTHORIZED, status = StatusCode.UNAUTHORIZED) {
    super(message, status)
  }
}

export class NotFoundError extends ErrorResponse {
  constructor(message = ReasonPhrase.NOT_FOUND, status = StatusCode.NOT_FOUND) {
    super(message, status)
  }
}
export class ForbiddenError extends ErrorResponse {
  constructor(message = ReasonPhrase.FORBIDDEN, status = StatusCode.FORBIDDEN) {
    super(message, status)
  }
}
