import commander from 'commander';

import { dockerfileGeneration } from '../index';
import HermitOptions from '../utils/lib/HermitOptions';
import { renderTitle } from '../utils/title';

const hermitCLI = async () => {
  renderTitle();

  commander
    .version('0.0.1')
    .description("A tool to automatically generate dockerfiles")
    .option('-m, --multi-stage', 'Experimental Feature: Generates Muti-Stage Dockerfiles')
    .parse(process.argv);

  const options: HermitOptions = {
    multiStage: false
  };

  //const dockerfileData = await dockerfileGeneration(process.argv[2], options);
  //console.log(dockerfileData);
}

hermitCLI();