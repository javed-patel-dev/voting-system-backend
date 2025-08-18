export const errorHandler = (err, req, res, next) => {
  return res.status(err.httpStatusCode).json(err.JSON);
};
