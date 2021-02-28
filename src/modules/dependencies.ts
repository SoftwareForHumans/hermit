import { execSync } from 'child_process';

import Syscall from '../utils/lib/Syscall';
import { readDebianPackages } from '../utils/fileSystem';

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

const filterPackages = (packagesList: Array<string>) => {
  const filteredPackages: Array<string> = new Array<string>();
  const debianPackages: Array<string> = readDebianPackages().split('\n');

  for (let i = 0; i < debianPackages.length; i++) {
    const debianPackage = debianPackages[i];

    const index = packagesList.indexOf(debianPackage);

    if (index > -1) {
      filteredPackages.push(debianPackage);
      packagesList.splice(index, 1);

      if (packagesList.length == 0) break;
    }
  }

  return filteredPackages;
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
    systemDependencies: filterPackages(systemDependencies)
  }
}

export default dependenciesModule;