import Docker from 'dockerode';

import HermitOptions from './lib/HermitOptions';
import logger from './logger';

const docker = new Docker();

export const buildImage = (options: HermitOptions) => new Promise<string>((resolve, reject) => {

  docker.buildImage(options.path, { dockerfile: 'Dockerfile.strace' }, (error, stream) => {
    if (error) {
      reject(error);
    }

    let imageId: string = "";

    if (stream) {
      stream.on('error', (error: Buffer) => {
        logger.error(error.toString());
      });

      stream.on('data', (dataBuffer: Buffer) => {
        imageId += dataBuffer.toString();
      });

      stream.on('end', () => {
        resolve(imageId.replace("\n", ""));
      });
    }

    reject(Error('The build of the image failed'));
  });
});

export const createContainer = (imageId: string, _options: HermitOptions, _workdir: string) => new Promise<Docker.Container>((resolve, reject) => {
  docker.createContainer({ Image: imageId }, (error, container) => {
    if (error) {
      reject(error);
    }

    if (container) {
      resolve(container);

    }

    reject('The creation of the container failed');
  });
});

export const removeImage = (imageId: string) => new Promise((resolve, reject) => {
  docker.getImage(imageId).remove();
});