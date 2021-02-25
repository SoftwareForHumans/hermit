const LOCAL_SITE_PACKAGES = "local-site-packages";

export const languageImages = [
  "python:3.8",
  "python:3.8-slim"
];

export const languageDependenciesInstallation = [
  "pip3 install --upgrade pip",
  `pip install -r ./requirements.txt --target ${LOCAL_SITE_PACKAGES}`
];

export const languageEnvVars = [
  `PYTHONPATH=./${LOCAL_SITE_PACKAGES}`
];

export const languageRuntime = "python3";