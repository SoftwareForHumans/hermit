import tracerModule from './modules/tracer';
import imageModule from './modules/image';
import dependenciesModule from './modules/dependencies';
import portsModule from './modules/ports';
import entrypointModule from './modules/entrypoint';
import generatorModule from './modules/generator';

export const dockerfileGeneration = async (command: string) => {
  // Module to trace software data
  const traceData = await tracerModule(command);

  // Modules to infer dockerfiles fields
  const imageData = imageModule();
  const dependenciesData = dependenciesModule();
  const portsData = portsModule();
  const entrypointData = entrypointModule();

  // Module to generate the dockerfile
  const generatorData = generatorModule(traceData);

  return generatorData;
}