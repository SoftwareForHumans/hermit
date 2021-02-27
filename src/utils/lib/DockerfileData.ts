export default interface DockerfileData {
  images: Array<string>,
  systemPackages: Array<string>,
  dependencies: Array<string>,
  ports: Array<number>,
  entrypoint: Array<string>,
  envVars: Array<string>
}