import commander from 'commander';

import { dockerfileGeneration, defaultOptions } from '../index';
import HermitOptions from '../utils/lib/HermitOptions';
import { renderTitle } from '../utils/title';

const hermitCLI = async () => {
  const version = require('../../package.json').version;

  commander
    .version(version)
    .arguments('<command>')
    .description("A tool to automatically generate dockerfiles", {
      command: 'The command to start the service'
    })
    .option('-m, --multi-stage', 'Experimental Feature: Generates Muti-Stage Dockerfiles')
    .option('-t, --timeout <number>', 'Timeout for the dynamic analysis')
    .option('-p, --path <string>', 'Path to the project directory')
    .option('-c, --container', 'Uses dynamic analysis in containerized projects')
    .parse(process.argv);

  renderTitle();

  const command: string = commander.args.join(" ");

  const options: HermitOptions = {
    multiStage: commander.multiStage || defaultOptions.multiStage,
    timeout: commander.timeout || defaultOptions.timeout,
    path: commander.path || defaultOptions.path,
    container: commander.container || defaultOptions.container
  };

  if (commander.args.length === 0 && !options.container) commander.help();

  const dockerfileData = await dockerfileGeneration(command, options);
  console.log(dockerfileData);
}

hermitCLI();