import tracerModule from './modules/tracer';
import inspectorModule from './modules/inspector';
import imageModule from './modules/image';
import dependenciesModule from './modules/dependencies';
import portsModule from './modules/ports';
import entrypointModule from './modules/entrypoint';
import generatorModule from './modules/generator';
import languageModule from './modules/languages'

import DockerfileData from './utils/lib/DockerfileData';

export const dockerfileGeneration = async (command: string) => {
  // Modules to analyse software data
  const inspectedData = await inspectorModule();
  const tracedData = await tracerModule(command);

  // Load module with strategies more appropriated to the detected Programming Language
  const languageData = await languageModule(inspectedData.language);

  // Modules to infer dockerfiles fields
  const imageData = imageModule(inspectedData, tracedData, languageData);
  const dependenciesData = dependenciesModule(inspectedData, tracedData, languageData);
  const portsData = portsModule(inspectedData, tracedData, languageData);
  const entrypointData = entrypointModule(inspectedData, tracedData, languageData);

  // Join Dockerfile Data
  const dockerfileData: DockerfileData = {
    images: imageData,
    systemPackages: dependenciesData.systemDependencies,
    dependencies: dependenciesData.languagueDependencies,
    ports: portsData,
    entrypoint: entrypointData,
    envVars: languageData.languageEnvVars
  }

  // Module to generate the dockerfile
  generatorModule(dockerfileData);

  return dockerfileData;
}