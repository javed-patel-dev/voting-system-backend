/* eslint-disable import/order */

import "dotenv/config";
import "reflect-metadata";

import compression from "compression";
import connectionTimeout from "connect-timeout";
import cors from "cors";
import express, { response } from "express";
import helmet from "helmet";
import { chain } from "lodash-es";
import requestIp from "request-ip";
import { customResponseInjector } from "./Middlewares/customResponseInjector.js";
import { globalRateLimiter } from "./Middlewares/globalRateLimiter.js";
import { disableGlobalHeaders } from "./Middlewares/disableGlobalHeaders.js";
import { hostNameValidator } from "./Middlewares/hostNameValidator.js";
import { logger } from "./Middlewares/Logger.js";
import { errorHandler } from "./Middlewares/errorHandler.js";
import { notFoundHandler } from "./Middlewares/notFoundHandler.js";
import { requestInjector } from "./Middlewares/requestInjector.js";

customResponseInjector(response);

const { PORT, NODE_ENV, CORS_ORIGINS, ALLOWED_HOSTNAMES } = process.env;

import routes from "./Routes/index.js";
import { MongoDb } from "./Configs/mongo.js";

const app = express();
const ORIGINS = chain(CORS_ORIGINS).replace(/\s/, "").split(",").value();
const HOSTNAMES = chain(ALLOWED_HOSTNAMES)
  .split(",")
  .map((item) => new RegExp(Buffer.from(item, "base64").toString("utf8")))
  .value();

const mongoDb = new MongoDb();
await mongoDb.connect(process.env.MONGO_URI);

app.use(connectionTimeout("1800s"));
app.use(helmet.hidePoweredBy());
app.use(hostNameValidator(HOSTNAMES.length ? HOSTNAMES : undefined));
app.use(compression());
app.use(
  cors({
    optionsSuccessStatus: 200,
    origin: ORIGINS.length === 1 ? ORIGINS[0] : ORIGINS,
    exposedHeaders: "*",
  })
);
app.use(helmet());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: false, limit: "50mb" }));
app.use(requestInjector);
app.use(requestIp.mw());

app.use(globalRateLimiter);
app.use(disableGlobalHeaders);
app.set("etag", false);

app.use("/online-voting-system", routes);
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`STARTING SERVER ON PORT - ${PORT} ENVIRONMENT - ${NODE_ENV}`, {
    component: "EXPRESS",
  });
});

process.on("unhandledRejection", (error) => {
  logger.error(`UNHANDLED REJECTION`, { component: "EXPRESS", error });
  process.exit(1);
});

process.on("uncaughtException", (error) => {
  logger.error(`UNCAUGHT EXCEPTION`, { component: "EXPRESS", error });
  process.exit(1);
});
