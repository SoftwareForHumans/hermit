const languages: Record<string, string> = {
  go: 'golang',
  java: 'java',
  js: 'javascript',
  py: 'python',
  web: 'web'
};

export const getLanguageMap = async (extension: string) => {
  const modulePath: string = './' + languages[extension];
  const { languageMap } = await import(modulePath);

  return languageMap;
}

