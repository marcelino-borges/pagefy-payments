import helmet from "helmet";
import cors from "cors";
import express from "express";
import routes from "./routes";
import dotenvSafe from "dotenv-safe";
import swaggerFile from "../swagger_output.json";
import swaggerUi from "swagger-ui-express";
import connectMongo from "./config/mongo";
import admin from "firebase-admin";
import firebaseConfig from "./config/firebase";
import { initializeStripe } from "./config/stripe";

admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(firebaseConfig)),
  storageBucket: JSON.parse(firebaseConfig).storageBucket,
});

dotenvSafe.config({
  allowEmptyValues: true,
});

const PORT = parseInt(process.env.PORT as string, 10);

console.log("PORT on env: ", PORT);

initializeStripe();

const app = express();
app.use(cors());

connectMongo();

app.use(helmet());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerFile));
app.use("/api/v1", routes);

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
