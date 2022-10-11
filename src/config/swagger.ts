import { runSwaggerAutogen } from "./../swagger/index";
import { getLatestVersionFromChangelog } from "./changelog";

const updateSwagger = async () => {
  const apiVersion = await getLatestVersionFromChangelog();
  runSwaggerAutogen(apiVersion);
};

updateSwagger();
