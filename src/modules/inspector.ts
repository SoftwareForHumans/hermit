import fs from 'fs';
import path from 'path'

const SUPPORTED_LANGUAGES: Array<string> = ['js', 'go', 'py', 'java', 'html', 'css'];
const INGORED_FOLDERS: Array<string> = ['node_modules'];

const updateCount = (file: string, info: any) => {
  const extension: string = file.split('.').pop() || 'null';
  if (SUPPORTED_LANGUAGES.includes(extension)) {
    info.files++;

    if (info.hasOwnProperty(extension)) {
      info[extension]++;
    }
    else {
      info[extension] = 1;
    }
  }
}

const detectLanguage = (info: any) => {
  const webValue: number = info.html || 0;
  if (webValue > 0) {
    info.language = 'web';
    return;
  }

  const keys = Object.keys(info);
  keys.shift();

  let maxKey = keys[0];
  let max = info[maxKey];

  for (let i = 1; i < keys.length; i++) {
    const key = keys[0];
    const value = info[key];

    if (value > max) {
      max = value;
      maxKey = key;
    }
  }

  info.language = maxKey;
}

const inspectorModule = async () => {
  const currDir: string = '.';
  const dirs: Array<string> = [currDir];

  let sourceInfo = {
    files: 0
  };

  try {
    for (let i = 0; i < dirs.length; i++) {
      // Current dir
      const dir = dirs[i];

      // Get the files as an array
      const files = await fs.promises.readdir(dir);

      // Loop them all with the new for...of
      for (const file of files) {
        // Get the full paths
        const filePath = path.join(dir, file);

        // Stat the file to see if we have a file or dir
        const stat = await fs.promises.stat(filePath);

        if (stat.isFile()) {
          // It's a file
          updateCount(file, sourceInfo);
        }
        else if (stat.isDirectory()) {
          // It's a directory
          if (!INGORED_FOLDERS.includes(file)) {
            dirs.push(filePath);
          }
        }


      }
    }
  }
  catch (e) {
    // Catch anything bad that happens
    console.error("Error: ", e);
  }

  detectLanguage(sourceInfo);
  console.log(sourceInfo);

  return sourceInfo;
}

export default inspectorModule;