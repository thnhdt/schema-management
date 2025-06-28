const StatusCode = {
  CREATED: 201,
  OK: 200
}
const ReasonStatusCode = {
  CREATED: 'Created sucessfully !',
  OK: 'OK response !'
}

export class SucessReponse {
  constructor({ message, statusCode = StatusCode.OK, reasonStatusCode = ReasonStatusCode.OK, metaData = {} }) {
    this.message = !message ? reasonStatusCode : message
    this.status = statusCode,
      this.metaData = metaData
  }
  send(res, headers = {}) {
    return res.status(this.status).json(this)
  }
}
export class OKReponse extends SucessReponse {
  constructor({ message, metaData }) {
    super({ message, metaData })
  }
}

export class CreatedResponse extends SucessReponse {
  constructor({ message, statusCode = StatusCode.CREATED, reasonStatusCode = ReasonStatusCode.CREATED, metaData }) {
    super({ message, statusCode, reasonStatusCode, metaData })
  }
}

