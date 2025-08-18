import moment from 'moment';
import { uuid } from 'uuidv4';

export const requestInjector = (req, response, next) => {
  req.requestId = uuid();
  req.requestEpoch = moment().valueOf();
  req.UTCOffset = moment().format('Z');

  response.set('x-request-id', req.requestId);
  response.set('x-utc-offset', req.UTCOffset);

  next();
};
