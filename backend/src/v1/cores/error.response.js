const StatusCode = require("../utils/status-code.util.js");
const ReasonPhrase = require('../utils/reason-phrase.util.js');

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

class BadResponseError extends ErrorResponse {
  constructor(message = ReasonStatusCode.FORBIDDEN, status = StatusCode.FORBIDDEN) {
    super(message, status)
  }
}
class ConflictResponseError extends ErrorResponse {
  constructor(message = ReasonStatusCode.CONFLICT, status = StatusCode.CONFLICT) {
    super(message, status)
  }
}

class AuthFailureError extends ErrorResponse {
  constructor(message = ReasonPhrase.UNAUTHORIZED, status = StatusCode.UNAUTHORIZED) {
    super(message, status)
  }
}

class NotFoundError extends ErrorResponse {
  constructor(message = ReasonPhrase.NOT_FOUND, status = StatusCode.NOT_FOUND) {
    super(message, status)
  }
}
class ForbiddenError extends ErrorResponse {
  constructor(message = ReasonPhrase.FORBIDDEN, status = StatusCode.FORBIDDEN) {
    super(message, status)
  }
}

module.exports = {
  ForbiddenError,
  NotFoundError,
  AuthFailureError,
  ConflictResponseError,
  BadResponseError
}