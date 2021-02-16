import tracerModule from './modules/tracer';
import inspectorModule from './modules/inspector';
import imageModule from './modules/image';
import dependenciesModule from './modules/dependencies';
import portsModule from './modules/ports';
import entrypointModule from './modules/entrypoint';
import generatorModule from './modules/generator';

export const dockerfileGeneration = async (command: string) => {
  // Module to trace software data
  const tracedData = await tracerModule(command);
  const inspectedData = inspectorModule();

  // Modules to infer dockerfiles fields
  const imageData = imageModule();
  const dependenciesData = dependenciesModule();
  const portsData = portsModule();
  const entrypointData = entrypointModule();

  // Module to generate the dockerfile
  const generatorData = generatorModule(tracedData);

  return generatorData;
}