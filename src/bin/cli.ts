import commander from 'commander';

import { dockerfileGeneration, defaultOptions } from '../index';
import HermitOptions from '../utils/lib/HermitOptions';
import { renderTitle } from '../utils/title';

const hermitCLI = async () => {
  renderTitle();

  const version = require('../../package.json').version;

  commander
    .version(version)
    .description("A tool to automatically generate dockerfiles")
    .option('-m, --multi-stage', 'Experimental Feature: Generates Muti-Stage Dockerfiles')
    .option('-t, --timeout <number>', 'Timeout for the dynamic analysis')
    .parse(process.argv);


  const command: string = commander.args.join(" ");

  const options: HermitOptions = {
    multiStage: commander.multiStage || defaultOptions.multiStage,
    timeout: commander.timeout || defaultOptions.timeout
  };

  const dockerfileData = await dockerfileGeneration(command, options);
  console.log(dockerfileData);
}

hermitCLI();