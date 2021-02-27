import tracerModule from './modules/tracer';
import inspectorModule from './modules/inspector';
import imageModule from './modules/image';
import dependenciesModule from './modules/dependencies';
import portsModule from './modules/ports';
import entrypointModule from './modules/entrypoint';
import generatorModule from './modules/generator';

import { languageData } from './languages'

import SystemInfo from './utils/lib/SystemInfo';
import DockerfileData from './utils/lib/DockerfileData';

export const dockerfileGeneration = async (command: string) => {
  // Modules to analyse software data
  const inspectedData = await inspectorModule();
  const tracedData = await tracerModule(command);

  // Get Detected Programming Language
  const { languageImages, languageDependenciesInstallation, languageEnvVars, languageRuntime } = await languageData(inspectedData.language);

  // Modules to infer dockerfiles fields
  const imageData = imageModule(languageImages);
  const dependenciesData = dependenciesModule(tracedData.openat, languageDependenciesInstallation);
  const portsData = portsModule(tracedData.bind);
  const entrypointData = entrypointModule(tracedData.execve, languageRuntime);

  // Join Dockerfile Data
  const dockerfileData: DockerfileData = {
    images: imageData,
    systemPackages: dependenciesData.systemDependencies,
    dependencies: dependenciesData.languagueDependencies,
    ports: portsData,
    entrypoint: entrypointData,
    envVars: languageEnvVars
  }

  // Module to generate the dockerfile
  generatorModule(dockerfileData);

  return dockerfileData;
}