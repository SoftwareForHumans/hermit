# Hermit
A tool to automatically generate dockerfiles for projects.
## Dependencies
  * [`Node.js`](https://nodejs.org/): JavaScript runtime environment
  * [`npm`](https://www.npmjs.com/get-npm): Node Package Manager
  * [`strace`](https://strace.io/): System calls tracker, and usually comes installed in the majority of Linux distributions by default.
  * [`grep`](): To filter only relevant information, and comes installed by default in all Unix-like Operating Systems.

## Install Node Modules
Run in the root of the project:
```bash
npm install
```

## How to run (from the root of the source code)
Run in the root of the project:
```bash
npm start <service_command>
```
Where `<service_command>` is the command to start the service, that is intended to be containerized. In the case of multiple words, the command should be inside parenthesis, like this `"<command_with_multiple_words>"`.

If the service is not set in the `PATH` environment variable, relative or absolutes paths work too.

A directory named `tmp/`, containing temporary files, will be generated in the root of the repository.

## Compile to JavaScript
While the previous command, does both compilation and execution, this command only compiles.

Run in the root of the project:
```bash
npm run build
```
The compiled JavaScript code would be located in the `dist/` directory.

## How to run compiled Javascript code
It is required first to have compiled with the previous command. This scenario offers the advantage of running the tool in any directory, while with `npm start` it is mandatory to be in the root of the project.

Run (in any directory):
```bash
node /path/to/root/dist/bin/hermit.js <service_command>
```

This time the directory `tmp/` will be generated in the current directory, where the tool is being executed.

