import { JupyterLiteServer, JupyterLiteServerPlugin } from '@jupyterlite/server'

import { IKernel, IKernelSpecs } from '@jupyterlite/kernel'
import { SchemeKernel } from './kernel'

// import jsLogo32 from '../style/icons/logo-32x32.png';
// import jsLogo64 from '../style/icons/logo-64x64.png';

const kernel: JupyterLiteServerPlugin<void> = {
  id: 'scheme-kernel-extension:kernel',
  autoStart: true,
  requires: [IKernelSpecs],
  activate: (app: JupyterLiteServer, kernelspecs: IKernelSpecs) => {
    kernelspecs.register({
      spec: {
        name: 'scheme',
        display_name: 'scheme',
        language: 'scheme',
        argv: [],
        resources: {
          'logo-32x32': '',
          'logo-64x64': '',
        },
      },
      create: async (options: IKernel.IOptions): Promise<IKernel> => {
        return new SchemeKernel(options)
      },
    })
  },
}

const plugins: JupyterLiteServerPlugin<any>[] = [kernel]

export default plugins
