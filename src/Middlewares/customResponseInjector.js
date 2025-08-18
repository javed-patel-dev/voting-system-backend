import moment from "moment";

export const customResponseInjector = (response) => {
  response.customResponse = function (
    httpStatusCode,
    data = null,
    success,
    requestId,
    requestEpoch
  ) {
    return this.status(httpStatusCode).json({
      requestId,
      success: !!success,
      requestEpoch,
      responseEpoch: moment().valueOf(),
      UTCOffset: moment().format("Z"),
      data,
    });
  };
};

