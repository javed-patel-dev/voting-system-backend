import ecsFormat from "@elastic/ecs-winston-format";
import { toUpper } from "lodash-es";
import * as winston from "winston";

const { NODE_ENV, SERVICE_NAME, SERVICE_VERSION, CORE_VERSION } = process.env;

winston.addColors({
  error: "red",
  warn: "yellow",
  info: "blue",
  http: "gray",
  debug: "white",
});

const Logger = winston.createLogger({
  level: "debug",
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
  },
  format: ecsFormat(),
  transports: [new winston.transports.Console()],
  defaultMeta: {
    application: "Online Voting System",
    environment: toUpper(NODE_ENV),
    microservice: SERVICE_NAME,
    microservice_version: SERVICE_VERSION,
    core_version: CORE_VERSION,
    component: "APPLICATION",
  },
});

export { Logger };
