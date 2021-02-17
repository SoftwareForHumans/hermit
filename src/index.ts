import tracerModule from './modules/tracer';
import inspectorModule from './modules/inspector';
import imageModule from './modules/image';
import dependenciesModule from './modules/dependencies';
import portsModule from './modules/ports';
import entrypointModule from './modules/entrypoint';
import generatorModule from './modules/generator';

import SystemInfo from './utils/lib/SystemInfo';
import DockerfileData from './utils/lib/DockerfileData';

export const dockerfileGeneration = async (command: string) => {
  // Module to trace software data
  const inspectedData = inspectorModule();
  const tracedData: SystemInfo = await tracerModule(command);

  // Modules to infer dockerfiles fields
  const dockerfileData: DockerfileData = {
    images: imageModule(),
    dependencies: dependenciesModule(tracedData.openat),
    ports: portsModule(tracedData.bind),
    entrypoint: entrypointModule(tracedData.execve)
  }

  // Module to generate the dockerfile
  generatorModule(dockerfileData);

  return dockerfileData;
}