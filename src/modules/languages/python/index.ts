import SourceInfo from '../../../utils/lib/SourceInfo';

const LOCAL_SITE_PACKAGES = "local-site-packages";

export const languageImages = [
  "python:3.8-slim",
  "gcr.io/distroless/python3"
];

export const languageDependenciesInstallation = [
  "pip3 install --upgrade pip",
  `pip install -r ./requirements.txt --target ${LOCAL_SITE_PACKAGES}`
];

export const languageEnvVars = [
  `PYTHONPATH=./${LOCAL_SITE_PACKAGES}`
];

export const languageRuntime = ["python", "python3"];

export const PACKAGES_LIST: string = 'pythonpackages.txt';

export const filesIgnored = [
  "__pycache__"
];

export const languageStaticInspection = (info: SourceInfo) => { };