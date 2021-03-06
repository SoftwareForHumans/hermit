import { writeDockerfile } from '../utils/fileSystem'

import DockerfileData from '../utils/lib/DockerfileData';
import DependencyData from '../utils/lib/DependencyData';


const generatorModule = (dockerfileData: DockerfileData) => {
  let isMultiStage: boolean = dockerfileData.images.length > 1;

  // Dockerfile content
  let content: string = "";

  // Start Build Stage Container
  content += "# Build Stage\n";

  // Choose base image to build the service
  content += `FROM ${dockerfileData.images[0]} ${isMultiStage ? "AS build-env" : ""}\n`;

  // Import service source code
  content += "ADD . /app\n";
  content += "WORKDIR /app\n";
  content += "\n";

  // Install system packages
  if (dockerfileData.systemPackages.length > 0) {
    content += "RUN apt-get update && \\\n";
    content += "\tapt-get install -y --no-install-recommends \\\n";
    content += "\t";

    dockerfileData.systemPackages.forEach((dep: DependencyData) => {
      content += ` ${dep.package}`
    });
    content += "\n";
  }

  // Install dependencies
  dockerfileData.dependencies.forEach((step: string) => {
    content += `RUN ${step}\n`
  })
  content += "\n";

  // Start Run Stage Container
  content += "# Run Stage\n";

  if (isMultiStage) {
    // Choose base image to run the service
    content += `FROM ${dockerfileData.images[1]}\n`;

    // Copy the service built in the previous stage
    content += "COPY --from=build-env /app /app\n";

    dockerfileData.systemPackages.forEach((dep: DependencyData) => {
      content += `COPY --from=build-env ${dep.path} ${dep.path}\n`
    });
    content += "\n";

    content += "WORKDIR /app\n";
  }


  // Expose network ports if needed
  if (dockerfileData.ports.length > 0) {
    content += "EXPOSE";
    dockerfileData.ports.forEach((port: number) => {
      content += ` ${port}`
    });
    content += "\n";
  }

  // Define Environment Variables if needed
  if (dockerfileData.envVars.length > 0) {
    content += "ENV";
    dockerfileData.envVars.forEach((env: string) => {
      content += ` ${env}`
    });
    content += "\n";
  }

  content += "\n";

  // Execute Service from its Entrypoint
  const quotedArgs: Array<string> = dockerfileData.entrypoint.map((argument: string) => {
    return `\"${argument}\"`;
  });
  content += `CMD [${quotedArgs.toString()}]\n`;

  // Write Dockerfile
  writeDockerfile(content);
  return;
}

export default generatorModule;