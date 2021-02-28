import { execSync } from 'child_process';

import Syscall from '../utils/lib/Syscall';

const getPackageName = (library: string) => {
  try {
    const packageName: string = execSync(`dpkg -S ${library}`, { stdio: 'pipe', encoding: 'utf-8' }).split(':')[0];

    return packageName;
  }
  catch (e) { }

  try {
    const packageName: string = execSync(`dpkg -S "$(readlink -f ${library})"`, { stdio: 'pipe', encoding: 'utf-8' }).split(':')[0];

    return packageName;
  }
  catch (e2) { }
  return null;
}

const isLibrary = (fileName: string) => {
  return fileName.split('.').includes('so') && !fileName.includes('python');
}

const dependenciesModule = (syscalls: Array<Syscall>, installationSteps: Array<string>) => {
  const analyzedDependencies: Array<string> = new Array<string>()
  const languageDependencies: Array<string> = new Array<string>()
  const systemDependencies: Array<string> = new Array<string>()

  syscalls.forEach((call) => {
    const fileName: string = call.args[1];

    if (analyzedDependencies.includes(fileName)) return;

    if (isLibrary(fileName)) {
      const packageName: string | null = getPackageName(fileName);

      if (packageName != null && !systemDependencies.includes(packageName)) {
        systemDependencies.push(packageName);
        console.log(`Package detected: ${packageName}`);
      }
    }
    else {
      languageDependencies.push(fileName);
    }

    analyzedDependencies.push(fileName);
  });

  return {
    languagueDependencies: installationSteps,
    systemDependencies: systemDependencies
  }
}

export default dependenciesModule;