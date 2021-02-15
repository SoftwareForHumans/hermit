import { dockerfileGeneration } from '../index';


const hermitCLI = async () => {
  const dockerfileData = await dockerfileGeneration(process.argv[2]);
  console.log(dockerfileData);
}

hermitCLI();