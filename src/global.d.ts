import { CoreViewer } from './vivliostyleTypes';

declare global {
  export interface Window {
    coreViewer: CoreViewer;
  }
}
