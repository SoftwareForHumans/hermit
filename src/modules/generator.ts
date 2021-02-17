import { writeDockerfile } from '../utils/fileSystem'

import DockerfileData from '../utils/lib/DockerfileData';


const generatorModule = (dockerfileData: DockerfileData) => {
  //TODO: Develop generator module
  let content: string = "";

  content += "# Build Stage\n";
  content += `FROM ${dockerfileData.images[0]} AS build-env\n`;
  content += "ADD . /app\n";
  content += "WORKDIR /app\n";
  content += "\n";
  content += "RUN npm ci --only=production\n";
  content += "\n";
  content += "# Run Stage\n";
  content += `FROM ${dockerfileData.images[1]}\n`;
  content += "COPY --from=build-env /app /app\n";
  content += "WORKDIR /app\n";

  content += "EXPOSE";
  dockerfileData.ports.forEach((port: number) => {
    content += ` ${port}`
  });
  content += "\n";

  content += "\n";

  const quotedArgs: Array<string> = dockerfileData.entrypoint.map((argument: string) => {
    return `\"${argument}\"`;
  });
  content += `CMD [${quotedArgs.toString()}]\n`;

  writeDockerfile(content);
  return;
}

export default generatorModule;