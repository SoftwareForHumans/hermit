import SourceInfo from '../utils/lib/SourceInfo';
import SystemInfo from '../utils/lib/SystemInfo';
import HermitOptions from '../utils/lib/HermitOptions'

const imageModule = (_inspectedData: SourceInfo, _tracedData: SystemInfo, languageData: any, _options: HermitOptions): Array<string> => languageData.languageImages;

export default imageModule;