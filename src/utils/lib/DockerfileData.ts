import DependencyData from './DependencyData';

export default interface DockerfileData {
  images: Array<string>,
  systemPackages: Array<DependencyData>,
  dependencies: Array<string>,
  ports: Array<number>,
  entrypoint: Array<string>,
  envVars: Array<string>,
  filesIgnored: Array<string>
}