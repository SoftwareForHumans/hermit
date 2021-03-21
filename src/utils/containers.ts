import tar from 'tar-fs';
import Docker from 'dockerode';

import HermitOptions from './lib/HermitOptions';
import logger from './logger';

const docker = new Docker();

export const buildImage = (options: HermitOptions) => new Promise<string>((resolve, reject) => {
  const tarDir = tar.pack(options.path);

  docker.buildImage(tarDir, { dockerfile: 'Dockerfile.strace', q: true }, (error, stream) => {
    if (error) {
      reject(error);
    }

    let imageId: string = "";

    if (stream) {
      stream.on('error', (error: Buffer) => {
        logger.error(error.toString());
      });

      stream.on('data', (dataBuffer: Buffer) => {
        const msg = JSON.parse(dataBuffer.toString())['stream'].replace("\n", "");
        logger.info(`Docker Message - ${msg}`);

        imageId = msg;
      });

      stream.on('end', () => {
        resolve(imageId.replace("\n", ""));
      });
    }
    else {
      reject(Error('Failed to stream from the docker socket'));
    }
  });
});

export const createContainer = (imageId: string, options: HermitOptions, workdir: string) => new Promise<Docker.Container>((resolve, reject) => {
  docker.createContainer({ Image: imageId, HostConfig: { Binds: [`${options.path}:${workdir}`] } }, (error, container) => {
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