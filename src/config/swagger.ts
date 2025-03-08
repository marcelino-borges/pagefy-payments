import { runSwaggerAutogen } from "@/swagger";
import { getLatestVersionFromChangelog } from "./changelog";

const updateSwagger = async () => {
  const apiVersion = await getLatestVersionFromChangelog();
  runSwaggerAutogen(apiVersion);
};

updateSwagger();
