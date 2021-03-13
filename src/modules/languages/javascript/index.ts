import { unescapeLeadingUnderscores } from 'typescript';
import SourceInfo from '../../../utils/lib/SourceInfo';
import logger from '../../../utils/logger';

export const languageImages = [
  "node:14",
  "gcr.io/distroless/nodejs:14"
];

export const languageDependenciesInstallation = [
  "npm ci --only=production"
];

export const languageEnvVars = [];

export const languageRuntime = "node";

export const PACKAGES_LIST: string = 'nodepackages.txt';

export const filesIgnored = [
  "node_modules"
];

export const languageStaticInspection = (info: SourceInfo) => {
  const path = process.env.PWD;

  try {
    const packageJson = require(`${path}/package.json`);
    const scripts = packageJson.scripts;

    if (scripts == undefined) return;

    for (let [key, _script] of Object.entries(scripts)) {
      info.scripts[key] = `npm ${key}`;
    }

  }
  catch (e) {
    logger.warn("package.json not found");
  }
};