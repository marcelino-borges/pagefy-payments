import helmet from "helmet";
import cors from "cors";
import express from "express";
import routesClient from "./routes/client.routes";
import routesWebhooks from "./routes/webhooks.routes";
import dotenvSafe from "dotenv-safe";
import admin from "firebase-admin";
import swaggerFile from "../swagger_output.json";
import swaggerUi from "swagger-ui-express";
import connectMongo from "./config/mongo";
import { initializeStripe } from "./config/stripe";
import firebaseConfig from "./config/firebase";
import log from "./utils/logs";

dotenvSafe.config({
  allowEmptyValues: true,
});

const canReadEnv = String(process.env.MONGO_CONNECTION_STRING).includes(
  "mongodb+srv://"
);

if (canReadEnv) {
  log.success(".ENV verified!");

  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(firebaseConfig)),
    storageBucket: JSON.parse(firebaseConfig).storageBucket,
  });

  const PORT = parseInt(process.env.PORT as string, 10);

  console.log("PORT on env: ", PORT);

  initializeStripe();

  const app = express();

  const publicCors = cors();
  // const privateCors = cors({
  //   origin: (origin, callback) => {
  //     if (!origin || ALLOWED_ORIGINS.indexOf(origin) === -1) {
  //       log.info("Blocked access from origin: " + origin);
  //       var msg =
  //         "The CORS policy for this site does not " +
  //         "allow access from the specified Origin.";
  //       return callback(new Error(msg), false);
  //     }
  //     return callback(null, true);
  //   },
  // });

  connectMongo()
    .then(() => {
      app.use(publicCors);
      app.use(helmet());
      app.options("*", publicCors);
      app.use("/health-check", publicCors, (_, res) =>
        res.status(200).json({ message: "API running." })
      );
      app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerFile));
      app.use("/api/v1/webhooks", routesWebhooks);
      app.use("/api/v1/client", routesClient);

      const server = app.listen(PORT, () => {
        console.log(`Listening on port ${PORT}`);
      });

      server.timeout = 3000;
    })
    .catch((e) =>
      log.error(
        "Error trying to connect to MongoDB. API not running.",
        "Details:",
        e
      )
    );
} else {
  log.error(".ENV not available. API not running.");
}
