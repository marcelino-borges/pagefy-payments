import { getPackageJson } from "../config/package-json";
import { userModel, errorModel } from "./models";

import swaggerAutogen from "swagger-autogen";

export const runSwaggerAutogen = async (apiVersion: string) => {
  const SWAGGER_OUTPUT_PATH = "./swagger_output.json";
  const ROUTES_PATH = ["./src/routes/index.ts"];
  const apiDescription = (await getPackageJson()).description;

  const doc = {
    info: {
      version: apiVersion,
      title: apiDescription.description,
    },
    host: "http://socialbio-payments.onrender.com",
    basePath: "/",
    consumes: ["application/json"],
    definitions: {
      User: userModel,
      Error: errorModel,
    },
  };

  swaggerAutogen()(SWAGGER_OUTPUT_PATH, ROUTES_PATH, doc);
};
