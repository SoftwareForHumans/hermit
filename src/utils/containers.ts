import tar from 'tar-fs';
import Docker from 'dockerode';

import HermitOptions from './lib/HermitOptions';
import logger from './logger';

const docker = new Docker();

export const buildImage = (options: HermitOptions) => new Promise<string>((resolve, reject) => {
  const imageTag = Math.random().toString(36).substr(2, 3)
    + Math.random().toString(36).substr(2, 3)
    + Math.random().toString(36).substr(2, 4);

  const tarDir = tar.pack(options.path);

  docker.buildImage(tarDir, { t: imageTag, dockerfile: 'Dockerfile.strace', q: true }, (error, stream) => {
    if (error) {
      reject(error);
    }

    let imageId: string = "";

    if (stream) {
      stream.on('error', (error: Buffer) => {
        logger.error(error.toString());
      });

      stream.on('data', (dataBuffer: Buffer) => {
        console.log(dataBuffer.toString());

        try {
          const msg = JSON.parse(dataBuffer.toString())['stream'].replace("\n", "");
          logger.info(`Docker Message - ${msg}`);

          imageId = msg;
        }
        catch (_e) {
          logger.warn(`Container Stream - ${dataBuffer.toString()}`);
        }
      });

      stream.on('end', () => {
        resolve(imageTag);
      });
    }
    else {
      reject(Error('Failed to stream from the docker socket'));
    }
  });
});

export const createContainer = (imageId: string, cmd: string, options: HermitOptions, workdir: string) => new Promise<Docker.Container>((resolve, reject) => {
  docker.createContainer(
    { Image: imageId, HostConfig: { Binds: [`${options.path}:${workdir}`] }, Cmd: cmd.split(" ") },
    (error, container) => {
      if (error) {
        reject(error);
      }

      if (container) {
        resolve(container);

      }

      reject('The creation of the container failed');
    });
});

export const removeImage = (imageId: string) => docker.getImage(imageId).remove({ force: true });