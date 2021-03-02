let module: any = null;

const languages: Record<string, string> = {
  go: 'golang',
  java: 'java',
  js: 'javascript',
  py: 'python',
  web: 'web'
};

export const languageData = async (extension: string) => {
  if (module == null) {
    const modulePath: string = './' + languages[extension];

    try {
      module = await import(modulePath);
    }
    catch (e) {
      console.log(`Hermit lacks support for language of extension ${extension}`);
    }
  }

  return module;
}
