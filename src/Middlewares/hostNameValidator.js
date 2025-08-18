import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { get } from "lodash-es";

export const hostNameValidator = (hostnames) => (request, response, next) => {
  const hostname = get(request, "headers.host");

  // Ignore Check if hostname is not getting passed
  if (!hostname || !hostnames) return next();

  const allowedHostnames = [
    ...(hostnames || []),
    /localhost:([1-9][0-9]{0,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$/,
    /.*\.svc\.cluster\.local$/,
    /.*\.svc\.cluster\.local:([1-9][0-9]{0,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$/,
    /(([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])/,
    /((([0-9a-fA-F]){1,4})\:){7}([0-9a-fA-F]){1,4}/,
  ];

  const isAllowed = allowedHostnames.some((candidate) => {
    if (typeof candidate === "string") {
      return candidate === hostname;
    } else if (candidate instanceof RegExp) {
      return candidate.test(hostname);
    }
    return false;
  });

  // Hostname Allowed
  if (isAllowed) return next();

  // For Not Allowed Hostnames
  return response
    .status(StatusCodes.BAD_REQUEST)
    .send(`${ReasonPhrases.BAD_REQUEST} | Hostname Not Allowed - ${hostname}`);
};
