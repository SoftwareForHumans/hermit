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
    module = await import(modulePath);
  }

  return module;
}
