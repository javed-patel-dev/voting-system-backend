import moment from "moment";

class CustomError extends Error {
  constructor(httpStatusCode, message, type, requestId, requestEpoch, reason) {
    super(message);
    this.name = this.constructor.name;

    this.httpStatusCode = httpStatusCode;
    this.type = type;
    this.requestId = requestId;
    this.requestEpoch = requestEpoch;
    this.reason = reason;
  }

  get HttpStatusCode() {
    return this.httpStatusCode;
  }

  get JSON() {
    return {
      requestId: this.requestId,
      success: false,
      requestEpoch: this.requestEpoch,
      responseEpoch: moment().valueOf(),
      UTCOffset: moment().format("Z"),

      data: {
        detail: this.message,
        type: this.type,
        ...(this.reason && {
          reason: this.reason,
        }),
        ...(process.env.NODE_ENV !== "production" && {
          stack: this.stack,
        }),
      },
    };
  }
}

export { CustomError };
