export default interface DockerfileData {
  images: Array<string>,
  dependencies: Array<string>,
  ports: Array<number>,
  entrypoint: Array<string>
}