import { writeDockerfile } from '../utils/fileSystem'


const generatorModule = (traceData: any) => {
  //TODO: Develop generator module
  let content: string = "";

  content += "# Build Stage\n";
  content += "FROM node:14 AS build-env\n";
  content += "ADD . /app\n";
  content += "WORKDIR /app\n";
  content += "\n";
  content += "RUN npm ci --only=production\n";
  content += "\n";
  content += "# Run Stage\n";
  content += "FROM gcr.io/distroless/nodejs:14\n";
  content += "COPY --from=build-env /app /app\n";
  content += "WORKDIR /app\n";

  content += "EXPOSE";
  traceData.ports.forEach((port: number) => {
    content += ` ${port}`
  });
  content += "\n";

  content += "\n";
  content += 'CMD ["src/index.js"]\n';

  writeDockerfile(content);

  return traceData;
}

export default generatorModule;