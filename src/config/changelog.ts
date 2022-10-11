import fs from "fs/promises";
import log from "../utils/logs";

export const getLatestVersionFromChangelog = async (): Promise<any> => {
  const CHANGELOG_PATH = "./changelog.md";

  return await fs
    .readFile(CHANGELOG_PATH, "utf8")
    .then((changelog) => {
      const lastVersionIndex = changelog
        .split("## Versions")[1]
        .split("\r\n")[2]
        .split("[")[1]
        .split("]")[0];
      return lastVersionIndex;
    })
    .catch((err: any) => {
      log.error(
        "Error reading changelog file when trying to get the latest version:\n" +
          err
      );
      return "0.0.0";
    });
};
