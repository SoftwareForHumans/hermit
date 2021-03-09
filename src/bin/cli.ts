import { dockerfileGeneration } from '../index';
import HermitOptions from '../utils/lib/HermitOptions';


const hermitCLI = async () => {

  const options: HermitOptions = {
    multiStage: false
  };

  const dockerfileData = await dockerfileGeneration(process.argv[2], options);
  console.log(dockerfileData);
}

hermitCLI();