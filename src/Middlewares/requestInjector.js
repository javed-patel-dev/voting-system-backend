import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';

export const requestInjector = (req, response, next) => {
  req.requestId = uuidv4();
  req.requestEpoch = moment().valueOf();
  req.UTCOffset = moment().format('Z');

  response.set('x-request-id', req.requestId);
  response.set('x-utc-offset', req.UTCOffset);

  next();
};
