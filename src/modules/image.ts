import SourceInfo from '../utils/lib/SourceInfo';
import SystemInfo from '../utils/lib/SystemInfo';

const imageModule = (_inspectedData: SourceInfo, _tracedData: SystemInfo, languageData: any): Array<string> => languageData.languageImages;

export default imageModule;